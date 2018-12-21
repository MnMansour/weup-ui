import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import styles from './styles.module.scss';

class ThreeD extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isUserInteracting: false,
      isUserRotating: false,
    }
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener( 'mousedown', this.onPointerStart, false );
    ReactDOM.findDOMNode(this).addEventListener( 'mousemove', this.onPointerMove, false );
		ReactDOM.findDOMNode(this).addEventListener( 'mouseup', this.onPointerUp, false );
    ReactDOM.findDOMNode(this).addEventListener( 'touchstart', this.onPointerStart, false );
		ReactDOM.findDOMNode(this).addEventListener( 'touchmove', this.onPointerMove, false );
		ReactDOM.findDOMNode(this).addEventListener( 'touchend', this.onPointerUp, false );
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this).removeEventListener( 'mousedown', this.onPointerStart, false );
    ReactDOM.findDOMNode(this).removeEventListener( 'mousemove', this.onPointerMove, false );
		ReactDOM.findDOMNode(this).removeEventListener( 'mouseup', this.onPointerUp, false );
    ReactDOM.findDOMNode(this).removeEventListener( 'touchstart', this.onPointerStart, false );
		ReactDOM.findDOMNode(this).removeEventListener( 'touchmove', this.onPointerMove, false );
		ReactDOM.findDOMNode(this).removeEventListener( 'touchend', this.onPointerUp, false );
  }

  onPointerStart = () => {
    this.setState({isUserInteracting: true})
  }

  onPointerMove = () => {
    if (this.state.isUserInteracting) {
      this.setState({isUserRotating: true})
    }
  }

  onPointerUp = () => {
    this.setState({
      isUserInteracting: false,
      isUserRotating: false,
    })
  }


  render() {
    const {isUserRotating, isUserInteracting } = this.state;
    return (
      <div className={styles.ThreeD}>
        <div>User Interacting: {isUserInteracting ? 'True' : 'False'}</div>
        <div>User Rotating: {isUserRotating ? 'True' : 'False'}</div>
      </div>
    );
  }

}

export default ThreeD;
