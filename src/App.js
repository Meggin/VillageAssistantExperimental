import React, { Component } from 'react';
import './App.css';

import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import firebase from 'firebase';
import 'firebase/firestore';
import LogoTran from './images//villagetwo.png';
import HelpLogo from './images/helpMe.png';
import TestChat from "./children/TestChat";
import Create from "./children/Create";
import Join from "./children/Join";

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

const messaging = firebase.messaging();

messaging.onMessage(function(payload) {
  console.log("On Message: ", payload);
});

class App extends Component {

  componentWillMount(){
    firebase.auth().onAuthStateChanged(function(auth) {

        const user = firebase.auth().currentUser;

        //User authenticated and active session begins.
        if (auth != null) {
          console.log('User authenticated: ' + user.displayName);
          console.log(user);
          var googleBtn = document.getElementById('googleBtn');
          googleBtn.classList.add('hide');
          let lout = document.getElementById("logoutButton");
          lout.classList.remove("hide")
          let err = "Welcome, " + user.displayName;
          let successful = "You are successfully logged in with Google."
          this.setState({
            err: err,
            successful: successful,
            showChat: true,
          });

        //User isn't authenticated.
        } else {
          console.log('User not authenticated.');
        }


      }.bind(this));
  };

  logout(event){
    firebase.auth().signOut();
    let lout = document.getElementById("logoutButton");
    lout.classList.add("hide")
    var googleBtn = document.getElementById('googleBtn');
    googleBtn.classList.remove('hide');
    let err = "Thanks!";
    let successful = "You have successfully logged out."
    this.setState({
      err: err,
      successful: successful,
      showChat: false,
    });
  }

  google(){
    console.log("this is google method")

    let provider = new firebase.auth.GoogleAuthProvider();
    let promise = firebase.auth().signInWithPopup(provider);
    messaging.requestPermission()
    .then(function() {
      console.log("Have permission");
      return messaging.getToken();
    })
    .then(function(token) {
      console.log("We have a token: " + token);
      let FBtoken = token
      promise
      .then( result => {
        let user = result.user;
        console.log(result);

        firebase.database().ref("users/"+user.uid).set({
          email: user.email,
          name: user.displayName,
          token: FBtoken,
          actionId: 0
        });

        // Add a new document in collection "users"
        firebase.firestore().collection("users").doc(user.email).set({
					userId: user.uid,
          email: user.email,
          name: user.displayName,
          token: FBtoken
        })
        .catch(function(error) {
          console.error("Error saving user in firestore: ", error);
        });

        let welcome = "Welcome, " + user.displayName ;
        this.setState({err: welcome});
    })
    .catch(function(err) {
      console.log('Error occurred in push', err);
    })


    });

    promise
    .catch(e => {
      let err = e.message;
      console.log(err);
    });
  }

  activeCreate(){
    const create = document.getElementById("createDiv")
    const landing = document.getElementById("landingDiv")
    const join = document.getElementById("joinDiv")
    const chat = document.getElementById("chatDiv")
    const testchat = document.getElementById("testChatDiv")
    testchat.classList.add("hide");
    join.classList.add("hide");
    create.classList.remove("hide");
    landing.classList.add("hide");
  }
  activeJoin(){
    const create = document.getElementById("createDiv")
    const landing = document.getElementById("landingDiv")
    const join = document.getElementById("joinDiv")
    const chat = document.getElementById("chatDiv")
    const testchat = document.getElementById("testChatDiv")
    testchat.classList.add("hide");
    create.classList.add("hide");
    landing.classList.add("hide");
    join.classList.remove("hide");
    console.log('clicked activeJoin');
  }

  homePage(){
    const create = document.getElementById("createDiv")
    const landing = document.getElementById("landingDiv")
    const join = document.getElementById("joinDiv")
    const chat = document.getElementById("chatDiv")
    const testchat = document.getElementById("testChatDiv")
    testchat.classList.add("hide");
    join.classList.add("hide");
    landing.classList.remove("hide");
    create.classList.add("hide");
  }

  activeTestChat(){
    const create = document.getElementById("createDiv")
    const landing = document.getElementById("landingDiv")
    const join = document.getElementById("joinDiv")
    const chat = document.getElementById("chatDiv")
    const testchat = document.getElementById("testChatDiv")
    testchat.classList.remove("hide");
    chat.classList.add("hide");
    join.classList.add("hide");
    landing.classList.add("hide");
    create.classList.add("hide");
  }

  handleLinkClick() {
    this.refs.dropdown.hide();
  }

  constructor(props){
    super(props);

    this.state = {
      err: '',
      successful: ' ',
      search: ' ',
      villageName: ' ',
      userToken: ' ',
      userSearch: ' ',
			villageId: ' '
    }

    this.logout          = this.logout.bind(this);
    this.google          = this.google.bind(this);
    this.homePage        = this.homePage.bind(this);
    this.activeCreate    = this.activeCreate.bind(this);
    this.activeJoin      = this.activeJoin.bind(this);
    this.activeTestChat  = this.activeTestChat.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  };

  render() {
    return (
      <div className="App" id="appDiv">

        <nav>
          <div className="nav-wrapper #80deea cyan lighten-3">
            <a href="index.html" className="brand-logo center" onClick={this.goHome}><img src={LogoTran} className="navLogo" alt="logo" /></a>
            <ul id="nav-mobile" className="left hide-on-small-only">
              <li><a onClick={this.activeCreate}>Create Village</a></li>
              <li><a onClick={this.activeJoin}>Join Village</a></li>

            </ul>
            <ul id="nav-mobile" className="right hide-on-small-only">
              <li><a>{this.state.err}</a></li>
              <li><a href="/testvillage">Chat</a></li>
              <li><a onClick={this.logout} className="hide" id="logoutButton">Logout</a></li>
              <li><a onClick={this.google} id="googleBtn">Login</a></li>
            </ul>

            <Dropdown className="hide-on-med-and-up right" ref="dropdown">
              <DropdownTrigger><i className="material-icons right">arrow_drop_down</i></DropdownTrigger>
              <DropdownContent tabIndex="0">
                <ul className="activelist" tabIndex="0">
                  <li tabIndex="0"><a href="index.html" onClick={this.goHome}>Go Home</a></li>
                  <li tabIndex="0"><a onClick={this.activeCreate}>Create Village</a></li>
                  <li tabIndex="0"><a onClick={this.activeJoin}>Join Village</a></li>
                  <li><a href="/testvillage">Chat</a></li>
                  <li tabIndex="0"><a onClick={this.logout} id="logoutButtonDrop">Logout</a></li><br />
                  <li tabIndex="0"><a onClick={this.google} id="googleBtnDrop">Login</a></li>
                </ul>
              </DropdownContent>
            </Dropdown>
          </div>
        </nav>
        <br />
        <div id="landingDiv">
          <h4 className="logoFont">Make One, Join One, Takes One.</h4>
          <img src={HelpLogo} alt="helplogo" id="helpLogo"/>
        </div>

        <Create />
        <Join />
        <TestChat />

      </div>
    );
  }
}

export default App;
