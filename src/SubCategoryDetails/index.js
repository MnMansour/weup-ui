import React, {Component} from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
//import classNames from 'classnames';
import {choseSubCategory} from '../redux/actions/notifications';
import styles from "./sub_category_details.module.css";

import close from '../assets/icons/close.svg';
import placeholder from '../assets/icons/placeholder.jpg';
import expandLess from '../assets/icons/expand_less.svg';
import expandMore from '../assets/icons/expand_more.svg';


class SubCategoryDetails extends Component {

  state = {
    readMore: false,
    showComponent: false
  }

  toggleReadmore = () => {
    this.setState({readMore: !this.state.readMore})
  }


  getSubCategoryDetails = (category, subCategory) => {
    const {list,choseSubCategory} = this.props;
    if (category && subCategory) {
      const currentCategory = _.find( list.categories,  ['name', category])
      const currentSubCategory = _.find( currentCategory.subcategories,  ['name', subCategory])

      if (currentSubCategory) {
        const generalData = this.generalData(currentSubCategory.data)
        return (
           <div className={styles.sub_category_details}>
            <div className={styles.sub_category_details_header}>
              <img src={placeholder} alt="place name"/>
              <span className={styles.header_title}>{currentSubCategory.sub_category_name}</span>
              <img onClick={()=>choseSubCategory(null)} src={close} alt="close"/>
            </div>
            <div className={styles.sub_category_details_general}>
              {generalData}
              <div className={styles.read_more}><span onClick={this.toggleReadmore}>{this.state.readMore ? 'Read less' : 'Read more'} <img src={this.state.readMore ? expandLess : expandMore} alt="expand"/></span></div>
            </div>
            {this.state.readMore && <div dangerouslySetInnerHTML={{__html: currentSubCategory.html}} />}
          </div>
        )
      } else {return null}
    } else {return null}
  }

  generalData = (data) => {
    return data.map((item, i)=> (
      <div key={i} className={styles.sub_category_details_general_field}>
        <span className={styles.field_title}>{item.title}:</span>
        {item.link && <a href={item.value}>{item.value}</a>}
        {!item.link && <span>{item.value}</span>}
      </div>
    ))
  }

  render() {
    const {chosenCategory, chosenSubCategory} = this.props;
    const subCategoryDetails = this.getSubCategoryDetails(chosenCategory ,chosenSubCategory)
    return(
      <div>
        {subCategoryDetails}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    list: state.categories_list,
    chosenCategory: state.notifications.chosenCategory,
    chosenSubCategory: state.notifications.chosenSubCategory,
  }
}

export default connect(mapStateToProps, {choseSubCategory})(SubCategoryDetails);
