import React, { Component } from "react";
import { connect } from 'react-redux';
import "./App.css";
import Categories from './Categories';
import SubCategoryDetails from './SubCategoryDetails';
import Hotspots from './Hotspots';

class App extends Component {


  render() {

    return (
      <div>
        {this.props.list.categories && <div>
          <div className="Filters">
            <SubCategoryDetails/>
            <Categories/>
          </div>
          <Hotspots/>
        </div>}

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
