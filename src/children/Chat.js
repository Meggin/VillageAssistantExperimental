import React, { Component } from 'react';
import firebase from 'firebase';

class Chat extends Component {

  findChats(){
    const user = firebase.auth().currentUser;
    let villageKeys = []
    let foundChats = []
    let self = this
    firebase.database().ref('users/' + user.uid + "/villageSubs").once('value', function(snapshot){


        if(snapshot.val() != null){

          snapshot.forEach(function(childSnapshot) {
            console.log("i'm here",childSnapshot.val().villageKey)
          villageKeys.push(childSnapshot.val().villageKey)
        })


        }else{
          console.log('not subbed to any villages')
        }

      }.bind(this))
      .then(() =>{
        self.setState({villageKeys: villageKeys})
        console.log(self.state.villageKeys)
        console.log('.then works')

        firebase.database().ref("/chats").once('value', (snapshot)=>{
          console.log(snapshot.val())
          snapshot.forEach(function(childSnapshot){
            console.log('chat val', childSnapshot.val().villageKey)
            console.log('child snap of villages',childSnapshot.key)
            for(var i = 0; i<villageKeys.length; i++){
              if(villageKeys[i] === childSnapshot.val().villageKey){
                console.log('child snap of villages val', childSnapshot.val())
                foundChats.push(childSnapshot.val())
              }else{
                console.log("nope!")
              }
            }
          })
        })
        .then(() =>{
           let self = this
          console.log('.then works here too!')
          console.log("foundChats", foundChats)
          self.setState({villageChats: foundChats})
        })
      });

  }

  writeChat() {
      var self = this;
      const user = firebase.auth().currentUser;

      var messageData = {
        chat: this.state.chat,
        username: user.displayName,
      };

      // Get a key for a new Post.
      let newMessageKey = firebase.database().ref("testvillage").child("message").push().key;

      // Write the new post's data simultaneously in the posts list and the user's post list.
      let updates = {};
      updates['/messages/' + newMessageKey] = messageData;

      return firebase.database().ref("testvillage/").update(updates).then(function(){
        self.setState({ chat: " " })
        console.log(self.state.chat)
      })


    }

    chatChange(event){
      this.setState({ chat: event.target.value })
      // console.log(this.state.chat)
    }

    updateScroll(){
      var element = document.getElementById("messageBox");
      element.scrollTop = element.scrollHeight;
    }

    scrollToBottom = () => {
       const messagesContainer = document.getElementById("messageBox")
       messagesContainer.scrollTop = messagesContainer.scrollHeight;
   };

   componentDidMount() {
      this.scrollToBottom();
  }

  componentDidUpdate() {
      this.scrollToBottom();
  }

  loopInTest(event){
    let selectMessages = []
    let self = this
    console.log('loopInTest', event.target.value)
    let chatKey = event.target.value
    firebase.database().ref("chats/"+chatKey+"/messages").on("value", (snapshot)=>{
      console.log(snapshot.val())
      snapshot.forEach(function(childSnapshot) {
      console.log(childSnapshot.val())
      selectMessages.push(childSnapshot.val())
      })
      self.setState({
        selectedChat: selectMessages,
        chatKey: chatKey
      });
      console.log(self.state.selectedChat)

    })

  }
  writeChatTwo() {
      var self = this;
      self.setState({selectedChat: []})
      const user = firebase.auth().currentUser;
      let chatKey = this.state.chatKey
      var messageData = {
        chat: this.state.chat,
        username: user.displayName,
      };

      // Get a key for a new Post.
      let newMessageKey = firebase.database().ref("chats/"+chatKey).child("messages").push().key;

      // Write the new post's data simultaneously in the posts list and the user's post list.
      let updates = {};
      updates['/messages/' + newMessageKey] = messageData;

      return firebase.database().ref("chats/"+chatKey).update(updates).then(function(){
        self.setState({ chat: " " })
        console.log(self.state.chat)
      })


    }


  constructor(props){
    super(props);

    this.state = {
      chat: ' ',
      messages: [],
      villageKeys: [],
      villageChats: [],
      selectedChat: [],
      chatKey: '',
    };
    firebase.database().ref('testvillage/messages').on('value', function(snapshot){
       let self = this
       let messages = [ ]
        if(snapshot.val() != null){
          snapshot.forEach(function(childSnapshot) {
          console.log(childSnapshot.val())
          messages.push(childSnapshot.val())
          })
          self.setState({messages: messages})
          console.log(self.state.messages)
        }else{
          console.log('no messages yet')
        }

      }.bind(this));

      firebase.database().ref("chats/"+this.state.chatKey+"/messages").on('value', function(snapshot){
         let self = this
         let selectedChat = [ ]
          if(snapshot.val() != null){
            snapshot.forEach(function(childSnapshot) {
            console.log(childSnapshot.val())
            selectedChat.push(childSnapshot.val())
            })
            self.setState({selectedChat: selectedChat})
            console.log(self.state.selectedChat)
          }else{
            console.log('no messages yet')
          }

        }.bind(this));

    this.writeChat = this.writeChat.bind(this);
    this.writeChatTwo = this.writeChatTwo.bind(this);
    this.chatChange = this.chatChange.bind(this);
    this.updateScroll = this.updateScroll.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.findChats = this.findChats.bind(this);
    this.loopInTest = this.loopInTest.bind(this);
  }

  render(){

    return(
      <div className="messageCom hide" id="chatDiv">
        <div id="findAChat">
          <div className="messagesList scroll" id="messageBoxVillage" >
              {this.state.villageChats.map(function(each){
                console.log(each)
                   var someMessages = each.messages
                   console.log(someMessages)
                   var theseMessages = [ ]

                  //  theseMessages.push(someMessages)
                   console.log(theseMessages)

                  //  TODO PUSH MESSAGES UP

                    for(var key in someMessages){
                      console.log('key', someMessages[key])
                      theseMessages.push(someMessages[key])
                      // theseMessages.push(someMessages)
                    }


                        return <div key={each.villageName}>

                          <p>{each.villageName}</p>
                          <button value={each.villageKey} onClick={this.loopInTest}>Chat Here</button>
                      </div>;
                 }.bind(this))}
           </div>
           <br />
          <button onClick={this.findChats}>Find Chats</button>
        </div>
        <br />
        <div>
          <div className="messagesList scroll" id="messageBox" >
          {this.state.selectedChat.map(function(each){

                 return <div>

                  <p>{each.username}: <br />{each.chat}</p>

               </div>;
          })}
        </div>
          <input value={this.state.chat} onChange={this.chatChange} className="inputBar"></input>

          <br />
          <button onClick={this.writeChatTwo} className="waves-effect waves-light btn #fbc02d yellow darken-2">Message</button>
        </div>
        <br />
        <div className="messagesList scroll" id="messageBox" >
               {this.state.messages.map(function(each){
                      return <div>

                        <p>{each.username}: <br />{each.chat}</p>
                    </div>;
               })}
         </div>

          <input value={this.state.chat} onChange={this.chatChange} className="inputBar"></input>

          <br />
          <button onClick={this.writeChat} className="waves-effect waves-light btn #fbc02d yellow darken-2">Message</button>
      </div>
    );
  }
}

export default Chat;
