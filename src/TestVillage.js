import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase';
import LogoTran from './images//villagetwo.png'
import Login from './Login';
import TestChat from "./children/TestChat";


const messaging = firebase.messaging();

messaging.onMessage(function(payload) {
  console.log("On Message: ", payload);
});


class TestVillage extends Component {

  componentDidMount(){

    const testchat = document.getElementById("testChatDiv")
    testchat.classList.remove("hide");

    const appDiv = document.getElementById("appDiv")
    appDiv.classList.add("hide");

  }
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
        let err = "Welcome, " + user.displayName ;
        this.setState({err: err});
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


  homePage(){
    const create = document.getElementById("createDiv")
    const landing = document.getElementById("landingDiv")
    const join = document.getElementById("joinDiv")
    const chat = document.getElementById("chatDiv")
    const testchat = document.getElementById("testChatDiv")
    testchat.classList.add("hide");
    chat.classList.add("hide");
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

  constructor(props){
    super(props);

    this.state = {
      err: '',
      successful: ' ',
      search: ' ',
      villageName: ' ',
      userToken: ' ',
      userSearch: ' ',
    }

    this.logout         = this.logout.bind(this);
    this.google         = this.google.bind(this);
    this.homePage       = this.homePage.bind(this);
    this.activeTestChat   = this.activeTestChat.bind(this);
    // this.pushToMyVillage= this.pushToMyVillage.bind(this);
  };

  render() {
    return (
      <div className="App">
        {/* TODO FIX DROPDOWN */}
        <ul id="dropdown1" className="dropdown-content">

          <li><a href="index.html" onClick={this.goHome}>Go Home</a></li>
          <li><a onClick={this.logout} id="logoutButtonDrop">Logout</a></li>
          <li><a onClick={this.google} id="googleBtnDrop">Login</a></li>

        </ul>
        <nav>
          <div className="nav-wrapper #80deea cyan lighten-3">
            <a href="index.html" className="brand-logo center" onClick={this.goHome}><img src={LogoTran} className="navLogo" alt="logo" /></a>
            <ul id="nav-mobile" className="left hide-on-small-only">
              <li><a href="index.html" onClick={this.goHome}>Go Home</a></li>


            </ul>
            <ul id="nav-mobile" className="right hide-on-small-only">
              <li><a>{this.state.err}</a></li>
              <li><a onClick={this.logout} className="hide" id="logoutButton">Logout</a></li>
              <li><a onClick={this.google} id="googleBtn">Login</a></li>

            </ul>
            <ul className="hide-on-med-and-up right">
              <li><a className="dropdown-button" href="#!" data-activates="dropdown1"><i className="material-icons right">arrow_drop_down</i></a></li>
            </ul>
          </div>
        </nav>
        <br />
        <TestChat />
        <Login />
      </div>
    );
  }
}

export default TestVillage;
