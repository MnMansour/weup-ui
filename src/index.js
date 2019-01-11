import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './redux/store';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));

window.updateReactState = (value) => {
  store.dispatch({type: 'CATEGORIES_UPDATED',
  payload: value})
}

window.rotateToSpotDone = (value) => {
  store.dispatch({type: 'ROTATE_UPDATED',
  payload: value})
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
