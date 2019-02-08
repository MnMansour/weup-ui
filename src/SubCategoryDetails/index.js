import React, {Component} from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
//import classNames from 'classnames';
import {choseSubCategory} from '../redux/actions/notifications';
import styles from "./sub_category_details.module.scss";

import close from '../assets/icons/close.svg';
import placeholder from '../assets/icons/placeholder.jpg';
import expandLess from '../assets/icons/expand_less.svg';
import expandMore from '../assets/icons/expand_more.svg';


class SubCategoryDetails extends Component {

  state = {
    readMore: false,
    showComponent: false,
    height: 0,
  }



  toggleReadmore = () => {
    this.setState({readMore: !this.state.readMore});
    this.setState({height: this.divElement.clientHeight})
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
             <div ref={ (divElement) => this.divElement = divElement} className={styles.header_box}>
              <div className={styles.sub_category_details_header}>
                <img src={currentSubCategory.icon? currentSubCategory.icon : placeholder} alt="place name"/>
                <h3>{currentSubCategory.name}</h3>
                <img onClick={()=>choseSubCategory(null)} src={close} alt="close"/>
              </div>
              <div className={styles.sub_category_details_general}>
                {generalData}
                <div className={styles.read_more}><span onClick={this.toggleReadmore}>{this.state.readMore ? 'Read less' : 'Read more'} <img src={this.state.readMore ? expandLess : expandMore} alt="expand"/></span></div>
              </div>
            </div>
            {this.state.readMore && <div style={{marginTop: this.state.height}} className={styles.html_content} dangerouslySetInnerHTML={{__html: currentSubCategory.html}} />}
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
