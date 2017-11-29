import React from 'react';

import ReactDOM from 'react-dom';
// removed Link,  Router,  browserHistory since not using from react-router-dom
import { BrowserRouter, Route } from 'react-router-dom'

import App from './App';
import TestVillage from './TestVillage';
import './index.css';

ReactDOM.render(
  <BrowserRouter>
      <div>
        <Route path="/testvillage" component={TestVillage} />
        <Route path="/" component={App} />

      </div>
  </BrowserRouter>,
   document.getElementById('root'));