import React, { Component } from 'react';
import firebase from 'firebase';


class TestChat extends Component {

    chatChange(event){
      this.setState({ chat: event.target.value })
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

  writeChatTwo() {
      var self = this;
      let user = firebase.auth().currentUser;
      let time = Date.now().toString() 
      var messageData = {
        chat: this.state.chat,
        username: user.displayName,
      };

      firebase.firestore().collection("chats").doc( self.state.chatURL).collection("messages").doc(time)
      .set(messageData)
      .then(function(){
          self.setState({ chat: " " })
      })

    }


  constructor(props){
    super(props);

    this.state = {
      chat: ' ',
      messages: [],
      chatURL: getUrlParameter('chat') || "waiting"
    };

    function getUrlParameter(sParam) {
          var sPageURL = decodeURIComponent(window.location.search.substring(1)),
              sURLVariables = sPageURL.split('&'),
              sParameterName,
              i;

          for (i = 0; i < sURLVariables.length; i++) {
              sParameterName = sURLVariables[i].split('=');

              if (sParameterName[0] === sParam) {
                  return sParameterName[1] === undefined ? true : sParameterName[1];
              }
          }
      };
    var chatID = getUrlParameter('chat');


      let self = this

      firebase.firestore().collection("chats").doc(self.state.chatURL).collection("messages")
      .onSnapshot(function(querySnapshot) {
       let messages = []
        querySnapshot.forEach(function(doc){
        messages.push({
          username: doc.data().username,
          chat: doc.data().chat
          })
        })
        self.setState({messages: messages})
      }.bind(this));

    this.writeChatTwo = this.writeChatTwo.bind(this);
    this.chatChange = this.chatChange.bind(this);
    this.updateScroll = this.updateScroll.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  render(){

    return(
      <div className="messageCom hide" id="testChatDiv">

        <div className="messagesList scroll" id="messageBox" >
               {this.state.messages.map(function(each){
                      return <div>

                        <p>{each.username}: <br />{each.chat}</p>
                    </div>;
               })}
         </div>

          <input value={this.state.chat} onChange={this.chatChange} className="inputBar"></input>

          <br />
          <button onClick={this.writeChatTwo} className="waves-effect waves-light btn #fbc02d yellow darken-2">Message</button>
      </div>
    );
  }
}

export default TestChat;
