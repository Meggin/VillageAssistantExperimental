import React, { Component } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';

class Create extends Component {

  createVillage(event) {
      event.preventDefault()
      let self = this;
      const user = firebase.auth().currentUser;

      if(user === null){
        self.setState({ successfulCreate: "You must be logged in to create a village."})
      } else {

        const user = firebase.auth().currentUser;
        const firestoreUserPath = firebase.firestore().collection("users").doc(user.email);
        let villageName = this.state.villageName

        // grabbing the token from the user in firestore
        firestoreUserPath.get().then(function(doc) {
            if (doc.exists) {
                self.setState({ userToken: doc.data().token })
            } else {
                console.log("No such document!");
            }
        }).then(function(){
          // TODO test this data with subbing to villages
          // Get a key for a new Post.
          let newVillageKey = firebase.database().ref().child("villages").push().key;
          let newVillageKeyFS = firebase.firestore().collection("villages").doc();

          self.setState({ villageId: newVillageKeyFS.id})
          // let messageKey = firebase.database().ref().child("villages").push().key;
          let villageData = {
            villageName: villageName,
            //subscribedUsers: null,

        }

        firebase.firestore().collection("villages").doc(self.state.villageId).set({
          villageName: villageName,
          villageId: self.state.villageId
        })
        .catch(function(error) {
          console.error("Error saving user in firestore: ", error);
        });
        firebase.firestore().collection("villages").doc(self.state.villageId).collection("userTokens").doc().set({
          token: self.state.userToken
        })
        .catch(function(error) {
          console.error("Error saving user in firestore: ", error);
        });

        firestoreUserPath.collection("villages").doc(self.state.villageId).set({
          villageId: self.state.villageId,
          villageName: self.state.villageName
        }).catch(function(error) {
          console.error("Error saving user in firestore: ", error);
        });


        // Write the new post's data simultaneously in the posts list and the user's post list.

        let updates = {};
        updates['/villages/' + newVillageKey] = villageData;

        return firebase.database().ref().update(updates).then( ()=>{
          let newName = self.state.villageName
          self.setState({
            successfulCreate: "Thanks! You created village " +newName,
            villageName: ' '
           })

        }).then(() => {

          let chatData = {
            villageKey: newVillageKey,
            villageName: villageName,
          }
          let newChatKey = firebase.database().ref().child("chats").push().key;

          let updates = {};
          updates['/chats/' + newVillageKey] = chatData;
          return firebase.database().ref().update(updates).then( ()=>{
            let newMessageKey = firebase.database().ref().child("chats/" +newVillageKey+ "/messages").push().key;
            let messageData = {
              chat: "First Message",
              username: "Welcome!"
            }
            let updates = {};

            updates['chats/'+ newVillageKey +"/messages/" + newMessageKey] = messageData;
              return firebase.database().ref().update(updates)
            // firebase.database().ref('chats/'+newVillageKey+'/messages').push("first message")
            // firebase.database().ref('chats/'+newVillageKey+'/messages').push("second message")
            // firebase.database().ref('chats/'+newVillageKey+'/messages').push("third message")
             })

        })
      })

    }

  }

  nameChange(event){
    this.setState({ villageName: event.target.value })
  }


  constructor(props){
    super(props);

    this.state = {
      villageName: ' ',
      userToken: ' ',
      successfulCreate: ' ',
    };

    this.createVillage = this.createVillage.bind(this);
    this.nameChange = this.nameChange.bind(this);
  }



  render() {
    return (
      <div id="createDiv" className="hide messageCom">
        <p>{this.state.successfulCreate}</p>
        <form onSubmit={this.createVillage}>
          <p className="center-align">Village Name</p>
          <input value={this.state.villageName} onChange={this.nameChange} className="inputBar"></input>
          <br />
          <button type="submit" className="waves-effect waves-light btn #fbc02d yellow darken-2">Create Village</button>
        </form>
      </div>
    );
  }
}

export default Create;
