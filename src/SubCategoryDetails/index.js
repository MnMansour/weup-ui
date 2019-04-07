import React, {Component} from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import EditSubcategoryModal from '../Modals/subCategoryDetailsModal';
import {choseSubCategory} from '../redux/actions/notifications';
import styles from "./sub_category_details.module.scss";

import close from '../assets/icons/close.svg';
import expandLess from '../assets/icons/expand_less.svg';
import expandMore from '../assets/icons/expand_more.svg';
import editIcon from '../assets/icons/edit.svg';
import {typesIcon} from '../types_icon';



class SubCategoryDetails extends Component {

  state = {
    readMore: false,
    showComponent: false,
    height: 0,
    isModalOpen: false,
    currentSubCategory: {},
  }



  toggleReadmore = () => {
    this.setState({readMore: !this.state.readMore});
    this.setState({height: this.divElement.clientHeight})
  }


  getSubCategoryDetails = (category, subCategory) => {
    const {choseSubCategory} = this.props;
    const currentSubCategory = this.getCurrentSubCategory();

      if (currentSubCategory) {
        const generalData = this.generalData(currentSubCategory.data)
        return (
           <div className={styles.sub_category_details}>
             <div ref={ (divElement) => this.divElement = divElement} className={styles.header_box}>
              <div className={styles.sub_category_details_header}>
                <img src={typesIcon(currentSubCategory.type ,currentSubCategory.icon)} alt="place name"/>
                <h3>{currentSubCategory.name}</h3>
                {this.props.dev_mode && <img onClick={()=>this.openModal()} src={editIcon} alt="Edit"/>}
                <img onClick={()=>choseSubCategory(null)} src={close} alt="close"/>
              </div>
              <div className={styles.sub_category_details_general}>
                {generalData}
                <div className={styles.read_more}><span onClick={this.toggleReadmore}>{this.state.readMore ? 'Read less' : 'Read more'} <img src={this.state.readMore ? expandLess : expandMore} alt="expand"/></span></div>
              </div>
            </div>
            {this.state.readMore && <div className={styles.html_container} style={{paddingTop: this.state.height}}><div className={styles.html_content} dangerouslySetInnerHTML={{__html: currentSubCategory.html}} /></div>}
          </div>
        )
      } else {return null}
  }

  openModal = () => {
    this.setState({isModalOpen: true})
  }

  closeModal = () => {
    this.setState({isModalOpen: false})
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

  getCurrentSubCategory = () => {
    const {list, chosenCategory, chosenSubCategory} = this.props;
    if (chosenCategory && chosenSubCategory) {
      const currentCategory = _.find( list.categories,  ['name', chosenCategory])
      const currentSubCategory = _.find( currentCategory.subcategories,  ['name', chosenSubCategory])
      return currentSubCategory
    } else return null
  }

  render() {
    const subCategoryDetails = this.getSubCategoryDetails();
    const currentSubCategory = this.getCurrentSubCategory()
    return(
      <div>
        {subCategoryDetails}
        {this.props.dev_mode && <EditSubcategoryModal Data={currentSubCategory ? currentSubCategory : {}} modalIsOpen={this.state.isModalOpen} closeModal={this.closeModal}/>}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dev_mode: state.notifications.dev_mode,
    list: state.categories_list,
    chosenCategory: state.notifications.chosenCategory,
    chosenSubCategory: state.notifications.chosenSubCategory,
  }
}

export default connect(mapStateToProps, {choseSubCategory})(SubCategoryDetails);
