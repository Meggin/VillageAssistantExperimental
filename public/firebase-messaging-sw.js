// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-database.js');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBoH243mOEwA0Q4q8cY5h8j3jCUE6ILeIE",
  authDomain: "villageassistanttwo.firebaseapp.com",
  databaseURL: "https://villageassistanttwo.firebaseio.com",
  projectId: "villageassistanttwo",
  storageBucket: "villageassistanttwo.appspot.com",
  messagingSenderId: "166514539860"
};
firebase.initializeApp(config);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

const db = firebase.database();



messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Payload received: ', payload);

  const parsedJSON = JSON.parse(payload.data.jsondata);

  console.log("What does the actions key look like? " + payload.data.actionID);

  console.log("What does the needy user ID look like? " + payload.data.needyUserID);

  console.log("What does the needy user email look like? " + payload.data.needyUserEmail);

  console.log("What does the needy user need look like?" + payload.data.needyUserNeed);

  console.log("What does the needy user display name look like?" + payload.data.needyUserDisplayName);

  console.log("What does actions look like? " + parsedJSON.actions);

  let actionID = (payload.data.actionID).toString();

  let needyUserID = (payload.data.needyUserID).toString();

  let needyUserNeed = (payload.data.needyUserNeed).toString();

  let needyUserEmail = (payload.data.needyUserEmail).toString();

  let needyUserDisplayName = (payload.data.needyUserDisplayName).toString();

  let notificationTitle = needyUserDisplayName + " needs " + needyUserNeed;

  let parsedBody = parsedJSON.body;

  let parsedActions = parsedJSON.actions;

  // Customize notification here
  const notificationOptions = {
    body: parsedBody,
    actions: parsedActions,
    data: {
      actionRecord: actionID,
      needyUserEmailRecord: needyUserEmail
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {

    event.notification.close();

    let notificationData = event.notification.data.actionRecord;

    console.log("This is what the action record looks like in service worker: " + notificationData);

    let needyUserData = event.notification.data.needyUserEmailRecord;

    console.log("This is what the needy user record looks like in service worker: " + needyUserData);

    const myPromise = new Promise(function(resolve, reject) {

      if (!event.action) {

        // Was normal notificaiton click
        console.log("User clicked notification but didn't answer.");

      } else if (event.action === 'yes') {

        console.log("User said yes.");

        const url = "https://villageassistanttwo.firebaseapp.com/testvillage?chat=" +notificationData;
        clients.openWindow(url);

        console.log("And now we can read the action record, I hope: " + notificationData);

        console.log("And now we can read the needy user email record, I hope: " + needyUserData);

        let userDatabaseRef = db.ref('/actions/' + notificationData + '/yesResponses');

        userDatabaseRef.transaction(function(currentYesCount) {
          return currentYesCount+1;
        });

      } else if (event.action === 'no') {

        console.log("User said no.");
        let userDatabaseRef = db.ref('/actions/' + notificationData + '/noResponses');
        userDatabaseRef.transaction(function(currentNoCount) {
          return currentNoCount+1;
        });
      } else {

        console.log("Unknown action clicked: '$event.action'");
      }

    // Once finished, call resolve() or  reject().
    resolve();
  });

  event.waitUntil(myPromise);

  // Do something as the result of the notification click
});

self.addEventListener('notificationclose', e => console.log("User closed notification " + e.notification));