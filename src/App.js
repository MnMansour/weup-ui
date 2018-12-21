import React, { Component } from 'react';
import ThreeD from './3DContainer' ;
import Filtering from './FilteringContainer';
import MapNavigation from './MapNavigationContainer';

import styles from './App.module.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.App}>
        <div className={styles.Filtering}><Filtering/></div>
        <div className={styles.MapNavigation}><MapNavigation/></div>
        <ThreeD />
      </div>
    );
  }
}

export default App;
