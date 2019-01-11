import React, { Component } from "react";
import { connect } from 'react-redux';
//import classNames from 'classnames';
import _ from 'lodash'
import {choseSubCategory, onHoverSubCategory, unHoverSubCategory} from '../redux/actions/notifications';
import Hotspot from '../Hotspot';

import styles from "./hotspots.module.css";

class Hotspots extends Component {

  getHotspots = (categoryName) => {
    if(categoryName) {
      const {list, subCategoryHover, chosenSubCategory, onHoverSubCategory, unHoverSubCategory, rotateDone} = this.props;

      const category = _.find(list.categories, ['name', categoryName])
      return category.subcategories.map((item, i)=> (
        <Hotspot
          key={i}
          data={item}
          subCategoryHover={subCategoryHover}
          chosenSubCategory={chosenSubCategory}
          onChoseSubCategory={this.onChoseSubCategory}
          onHover={onHoverSubCategory}
          unHover={unHoverSubCategory}
          rotateDone={rotateDone}
        />
      ))

    } else {
      return null
    }
  }

  onChoseSubCategory = (name, horizontalCoordinates) => {
    this.props.choseSubCategory(name);
    window.rotateToSpot(horizontalCoordinates)
  }



  render() {

    const getHotspots = this.getHotspots(this.props.chosenCategory)

    return (
      <div className={styles.Hotspots} >
        {getHotspots}
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    list: state.categories_list,
    chosenCategory: state.notifications.chosenCategory,
    chosenSubCategory: state.notifications.chosenSubCategory,
    subCategoryHover: state.notifications.subCategoryHover,
    rotateDone: state.notifications.rotateDone
  }
}

export default connect(mapStateToProps, {choseSubCategory, onHoverSubCategory, unHoverSubCategory}) (Hotspots);
