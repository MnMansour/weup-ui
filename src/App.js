import React, { Component } from "react";
import { connect } from 'react-redux';
import cookie from 'react-cookies'
import 'react-confirm-alert/src/react-confirm-alert.css';
import "./App.css";
import Categories from './Categories';
import SubCategoryDetails from './SubCategoryDetails';
import Hotspots from './Hotspots';
import WelcomeMessage from './WelcomeMessage';

class App extends Component {

  state = {
    firstTimeRunning: false
  }

  componentDidMount() {
    const firstTimeRunning = cookie.load('firstTime');

    if(!firstTimeRunning) {
      cookie.save('firstTime', 'firstTime')
      this.setState({firstTimeRunning: true})
    }
  }

  closeWelcomeMessage = () => {
    this.setState({firstTimeRunning:false})
  }


  render() {

    return (
      <div className="horizontalCoordinates">
        {this.props.list.categories &&
          <div>
            <SubCategoryDetails/>
            <Categories/>
            <Hotspots/>
            <WelcomeMessage closeWelcomeMessage={this.closeWelcomeMessage}  show={this.state.firstTimeRunning}/>
          </div>
        }

        <div></div>
      </div>

    )
  }
}

function mapStateToProps (state) {
  return {
    list: state.categories_list,
  }
};


export default connect(mapStateToProps, null) (App);
