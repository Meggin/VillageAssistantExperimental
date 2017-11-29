'use strict';

const functions = require('firebase-functions');

const google = require('googleapis');

const admin = require("firebase-admin");

const jwt = require("jwt-decode");

const firebaseConfig = functions.config().firebase;

admin.initializeApp(firebaseConfig);

process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').DialogflowApp;

const crypto = require('crypto');

const GoogleAuth = require('google-auth-library');

//TODO: add your own client ID and secret.

const CLIENT_ID = "Put your client ID here";

const CLIENT_SECRET = "Put your client secret here";

const WEB_AUTH_URL = "https://${firebaseConfig.authDomain}";

// Time to expire the access token (1h).
const EXPIRATION_TIME = 60;

const GET_HELP = 'get.help';

const GET_RESPONSES = 'get.responses';

const USER_NEED_INTENT = 'userNeedIntent';

const USER_NEED = 'need';

const ITEM_SELECTED = 'item.selected';

const NEED_SELECTED = 'need.selected';

const REQUEST_UPDATE = 'update';

const tokenArray = [];

const userResponses = [];

const userVillages = [];

const userFirstThreeVillages = [];

const villageTokenArray = [];

let matchingUser = [];

function createResponsesArray(userResponses, needyUser) {

  admin.database().ref("user-actions/" + needyUser).on("value", function(snapshot){
    snapshot.forEach(childSnapshot => {
      childSnapshot.forEach(data => {
        var actionResponse = {};
        // actionResponse.key = childSnapshot.key;
        actionResponse.actionTitle = childSnapshot.val().actionTitle;
        actionResponse.responseTotal = childSnapshot.val().responseTotal;
        actionResponse.yesResponses = childSnapshot.val().yesResponses;
        userResponses.push(actionResponse);
      })

    })
  })
}

function findExistingActionsForUser(assistant, needyUserEmailForUpdates) {

  console.log("We are passing email for user who wants updates to function: " + needyUserEmailForUpdates);

  let userNeeds = []

  admin.firestore().collection("userActions").doc(needyUserEmailForUpdates).collection("actions")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc){
      userNeeds.push({
        id: doc.data().actionID,
        need: doc.data().userNeed
      })
    })
  }).then(function() {

    let needOneName = userNeeds[0].need;

    console.log("NEED ONE NAME: " + needOneName);

    let needTwoName = userNeeds[1].need;

    console.log("NEED TWO NAME: " + needTwoName);

    let needThreeName = userNeeds[2].need;

    let NEED_ONE = userNeeds[0].need + "," + userNeeds[0].id;

    console.log("NEED ONE data: " + NEED_ONE);

    let NEED_TWO = userNeeds[1].need + "," + userNeeds[1].id;

    let NEED_THREE = userNeeds[2].need + "," + userNeeds[2].id;

        // creates a car Carousel to display to user then send the result to itemSelected
    assistant.askWithList(assistant.buildRichResponse()
         .addSimpleResponse("Select need for updates:")
         .addSuggestions(
           ['Basic Card', 'List', 'Carousel', 'Suggestions']),
         assistant.buildList("Select need for updates:")
         .addItems(assistant.buildOptionItem(NEED_ONE)
           .setTitle(needOneName)
           .setDescription("Click here to select your " + needOneName))
         .addItems(assistant.buildOptionItem(NEED_TWO)
           .setTitle(needTwoName)
           .setDescription("Click here to select your " + needTwoName))
         .addItems(assistant.buildOptionItem(NEED_THREE)
           .setTitle(needThreeName)
           .setDescription("Click here to select your " + needThreeName)
         )
       );

  })

}

function findVillagesForNeedyUser(assistant, needyUserEmail, need, needyUserDisplayName) {
  // this array will store the names and ids of the user villages when they are queried from firestore

  console.log("We are passing need into finding villages too: " + need);

  let userVillages = []
  // assistant searches under users in firestore for a match to the users email
  // then pull the villages collection
  admin.firestore().collection("users").doc(needyUserEmail).collection("villages")
  .get()
  .then(function(querySnapshot) {
    // for each document pulled back it pushes an object for the village name and id
    querySnapshot.forEach(function(doc){
      userVillages.push({
        name: doc.data().villageName.trim(),
        id: doc.data().villageId
      })
    })
  }).then(function(){
    // once all village objects are pushed assistant takes the first three
    let villageOneName = userVillages[0].name;

    let villageTwoName = userVillages[1].name;

    let villageThreeName = userVillages[2].name;

    let VILLAGE_ONE = userVillages[0].name + "," + userVillages[0].id + "," + need + "," + needyUserDisplayName + "," + needyUserEmail;

    let VILLAGE_TWO =  userVillages[1].name + "," + userVillages[1].id + "," + need + "," + needyUserDisplayName + "," + needyUserEmail;

    let VILLAGE_THREE =  userVillages[2].name + "," + userVillages[2].id + "," + need + "," + needyUserDisplayName + "," + needyUserEmail;

    // creates a car Carousel to display to user then send the result to itemSelected
    assistant.askWithList(assistant.buildRichResponse()
         .addSimpleResponse("Select best village for your need.")
         .addSuggestions(
           ['Basic Card', 'List', 'Carousel', 'Suggestions']),
         assistant.buildList("Select best village for your need:")
         .addItems(assistant.buildOptionItem(VILLAGE_ONE)
           .setTitle(villageOneName)
           .setDescription("Click here to select your " + villageOneName))
         .addItems(assistant.buildOptionItem(VILLAGE_TWO)
           .setTitle(villageTwoName)
           .setDescription("Click here to select your " + villageTwoName))
         .addItems(assistant.buildOptionItem(VILLAGE_THREE)
           .setTitle(villageThreeName)
           .setDescription("Click here to select your " + villageThreeName)
         )
       );
  })
}

exports.villageApp = functions.https.onRequest((req, res) => {

  console.log("Village app request body: " + JSON.stringify(req.body));

  const needyUser = req.body.originalRequest.data.user.userId;

  const assistant = new Assistant({request: req, response: res});

  let actionMap = new Map();
  actionMap.set(GET_HELP, askNeedHandler);
  actionMap.set(GET_RESPONSES, selectNeedResponses);
  actionMap.set(USER_NEED_INTENT, userNeedHandler);
  //actionMap.set(LIST, villageHandler);
  actionMap.set(ITEM_SELECTED, itemSelected);
  actionMap.set(REQUEST_UPDATE, updateHandler);
  actionMap.set(NEED_SELECTED, needSelected);
  assistant.handleRequest(actionMap);

  function askNeedHandler (assistant) {
    assistant.ask("Great! Let's get you help. What do you need?");
  }

  function selectNeedResponses (assistant) {
    
    assistant.ask("We need to retrieve your active needs. Sound good?");

  }

  function userNeedHandler (assistant) {

    let need = assistant.getArgument(USER_NEED);

    console.log("Milk Handler has need: " + need);

    const authToken = assistant.getUser().accessToken;

    console.log("We have an auth token: " + authToken);

    if (authToken) {
    	console.log('User', assistant.getUser());
    	refs.access.child(authToken).once('value').then(data => {
      		const sub = data.val();
      		return refs.users.child(sub).once('value');
    	})
    	.then(data => {
      		const profile = data.val().profile;
      		console.log('Profile', profile);

      		const needyUserEmail = profile.email;
      		console.log("We have EMAIL!: " + needyUserEmail);

      		const needyUserDisplayName = profile.name;
      		console.log("We have display name!: " + needyUserDisplayName);

      		findVillagesForNeedyUser(assistant, needyUserEmail, need, needyUserDisplayName);
      		
    	})
    	.catch(e => {
      		console.log('Error', e);
      		assistant.tell('An error occurred when getting the user profile');
    	});
  	} else {
    	assistant.tell('The access token received was empty');
  	}

  }

  function needSelected (assistant) {
    // param is user selected need
    const param = assistant.getSelectedOption();

    console.log("User selected need: " + param);

    const selectedNeedArray = param.split(',');

    console.log("We have array with selected need: " + selectedNeedArray[0]);

    let selectedNeed = selectedNeedArray[0];

    let selectedNeedID = selectedNeedArray[1];

    // assistant communicates the selected option to the user
    if (!param) {
      assistant.tell("You didn't select a need");
    } else {

      admin.database().ref("actions/"+ selectedNeedID).on("value", function(snapshot){
        console.log('We are in actions and getting an update: ' + JSON.stringify(snapshot.val()))

        let responseTitle = snapshot.val().userNeed;

        let responseCount = snapshot.val().responseTotal;

        let responseYesCount = snapshot.val().yesResponses;

        let responseNoCount = snapshot.val().noResponses;

        let chatURL = "https://villageassistanttwo.firebaseapp.com/testvillage?chat=" +selectedNeedID;

        assistant.ask(assistant.buildRichResponse()
          .addSimpleResponse("Here's an update on getting help with: " + responseTitle)
          .addBasicCard(assistant.buildBasicCard("Number of possible responses: " + responseCount + ". People who said yes: " + responseYesCount + ". People who said no: " + responseNoCount + ".")
          .setTitle("Your request: " + responseTitle)
          .addButton('Go To Chat', chatURL)
          )
        )
      })
     
    }

  }

  function itemSelected (assistant) {
    // param is user selected village
    const param = assistant.getSelectedOption();

    console.log('USER SELECTED: ' + param);

    const selectedVillageArray = param.split(',');

    console.log("We have array with needy user: " + selectedVillageArray[0]);
  // not sure how important this is, may need to include this in the object
    let selectedUser = selectedVillageArray[0];

    let selectedUserNeed = selectedVillageArray[2];

    console.log("What is selected user need? " + selectedUserNeed);

    let selectedUserDisplayName = selectedVillageArray[3];

    console.log("What is selected user display name? " + selectedUserDisplayName);

    let selectedUserEmail = selectedVillageArray[4];

    console.log("What is needy user's email? " + selectedUserEmail);

// assistant communicates the selected option to the user
    if (!param) {
      assistant.tell('You did not select any village');
    } else {
      assistant.tell('You selected: ' + selectedVillageArray[0]);
    }
// digging into firestore to get user tokens to push notification to
    let pushTokens = []
    admin.firestore().collection("villages").doc(selectedVillageArray[1]).collection("userTokens")
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc){
        pushTokens.push(doc.data().token)
      })
    }).then(function(){
      console.log("VILLAGE TOKEN ARRAY TO PUSH TO PAYLOAD", pushTokens)
      let newDocKey = admin.firestore().collection("actions").doc()
      let keyString = newDocKey.id;
      // pushing to firebase to not upset the service worker
      // maybe able to update to firestore later

      admin.firestore().collection("userActions").doc(selectedUserEmail).collection("actions").doc(keyString)
      .set({
        actionID: keyString,
        userNeed: selectedUserNeed
      })

      let possibleResponses = pushTokens.length;

      admin.database()
        .ref("/actions/" + keyString)
        .set({
          userNeed: selectedUserNeed,
          needyUserEmail: selectedUserEmail,
          responseTotal: possibleResponses,
          yesResponses: 0,
          noResponses: 0,
          closedNotification: 0,
          otherResponses: 0
        })

      admin.firestore().collection("chats").doc(keyString)
      .set({
        villageID: selectedVillageArray[1],
        villageName: selectedVillageArray[0],
      })

      console.log("Action ID Key String", keyString)
      const needyUserString = needyUser.toString();

      console.log("What is needy user string? " + needyUserString);

      const payload = {
        "data": {
          "actionID": keyString,
          "needyUserID": needyUserString,
          "needyUserEmail": selectedUserEmail,
          "needyUserNeed": selectedUserNeed,
          "needyUserDisplayName": selectedUserDisplayName,
          "jsondata": "{\"body\":\"Click Yes to help!\",\"actions\": [{\"action\":\"yes\", \"title\":\"Yes\"},{\"action\":\"no\",\"title\":\"No\"}]}"
        }
      };

      admin.messaging().sendToDevice(pushTokens, payload)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
    })

  }

  function updateHandler (assistant) {

   	const authTokenForUpdate = assistant.getUser().accessToken;

   	if (authTokenForUpdate) {

    	console.log('Getting user token for updates!', assistant.getUser());

    	refs.access.child(authTokenForUpdate).once('value').then(data => {
      		const sub = data.val();
      		return refs.users.child(sub).once('value');
    	})
    	.then(data => {
      		const profile = data.val().profile;
      		console.log('Profile retrieved for user requesting updates', profile);

      		const needyUserEmailForUpdates = profile.email;
      		console.log("We have EMAIL for user who wants updates: " + needyUserEmailForUpdates);

      		admin.database().ref("users").on("value", function(snapshot) {

      			snapshot.forEach(childSnapshot => {

      				let userEmail = childSnapshot.val().email;

      				console.log('You are inside snapshotForEach and this is user email ', childSnapshot.val().email);

      				if (needyUserEmailForUpdates === userEmail) {

      					console.log("We have a matching user, woot." + userEmail);

                findExistingActionsForUser(assistant, needyUserEmailForUpdates);
      				}	
    			})
    		})
    	})
    	.catch(e => {
      		console.log('Error getting user profile for updates', e);
      		assistant.tell('An error occurred when getting the user profile');
    	});
  	} else {
    	assistant.tell("Sorry but I'm having trouble finding your updates");
  	}

  }

});


// TODO: Write OAuth2 Server code here.