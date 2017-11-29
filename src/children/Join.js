import React, { Component } from 'react';
import firebase from 'firebase';

class Join extends Component {

// currently this fucntion is not being used
// it renders villages the user is already joined to
// can be removed if we find no use for it
  viewVillage(event){
    let self = this;
    const user = firebase.auth().currentUser;
    let villages = [];
    firebase.firestore().collection("users").doc(user.email).collection("villages")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            villages.push({
              name: doc.data().villageName.trim(),
              key: doc.data().villageId
        })
      })
    }).then(function(){
      self.setState({villages: villages})
    })
    let moreVillages = [];
    firebase.firestore().collection("villages")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            moreVillages.push({
              name: doc.data().villageName.trim(),
              key: doc.data().villageId
        })
      })
    })
  }

// this function finds all villages under the village collection
// it then pulls the id of the villages the user is already subbed into
// if there is a match it doesn't push that village to the array and set the state
// therefore it is not shown to the user
  viewMoreVillages(event) {
    let self = this;
    const user = firebase.auth().currentUser;
    let villages = [];
    firebase.firestore().collection("users").doc(user.email).collection("villages")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            villages.push(
              doc.data().villageId
            )
      })
    }).then(function(){
      let moreVillages = [];
      firebase.firestore().collection("villages")
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              if(villages.includes(doc.data().villageId) === false) {
                moreVillages.push({
                  name: doc.data().villageName.trim(),
                  key: doc.data().villageId
            })
          }
        })
      }).then(function() {
        self.setState({moreVillages: moreVillages})
      })
    })

  }

// this function joins the user to the village
// it sends the users token to the village in firestore
// then stores the village data in the users doc
  joinVillage(event){
    let key = event.target.id
    let name = event.target.value
    const user = firebase.auth().currentUser;
    let self = this;
    let villageData = ({
      villageId: key,
      villageName: name
    })
    firebase.firestore().collection("users").doc(user.email)
    .get()
    .then(function(doc){
      self.setState({userToken: doc.data().token})
    }).then(function(){
      let data = ({token: self.state.userToken})
      firebase.firestore().collection("villages").doc(key).collection("userTokens").doc(self.state.userToken)
      .set(data)
    })
    firebase.firestore().collection("users").doc(user.email).collection("villages").doc(key)
    .set(villageData)
  }



  constructor(props){
    super(props);

    this.state = {
      villages: [],
      moreVillages: [],
      userToken: ''
    };


    this.viewVillage = this.viewVillage.bind(this);
    this.viewMoreVillages = this.viewMoreVillages.bind(this);
    this.joinVillage = this.joinVillage.bind(this);
  }


  render() {
    return (
      <div id="joinDiv" className="hide messageCom">

          <div >
             {this.state.moreVillages.map( (each) => {
             return <div key={each.key}>
                      <p>{each.name}</p>
                      <button onClick={this.joinVillage} value={each.name} id={each.key} key={each.key} className="waves-effect waves-light btn #fbc02d yellow darken-2">Join</button>
                  </div>;
             })}
             <br />
             <button onClick={this.viewMoreVillages} className="waves-effect waves-light btn #fbc02d yellow darken-2">View More Villages</button>
           </div>
      </div>
    );
  }
}

export default Join;
