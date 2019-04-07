import React, {Component} from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { confirmAlert } from 'react-confirm-alert';

import {choseSubCategory, onHoverSubCategory, unHoverSubCategory} from '../redux/actions/notifications';

import styles from "./sub_category.module.scss";
import {typesIcon} from '../types_icon';
import editIcon from '../assets/icons/edit.svg';
import deleteIcon from '../assets/icons/delete.svg';

class SubCategory extends Component {

  state = {
    editSubCategoryName: false,
    subCategoryName: '',
    subCategoryType: '',
  }

  onChoseSubCategory = (subcategory) => {
    this.props.choseSubCategory(subcategory.name);
    subcategory.rotateToMe();
  }

  removeSubCategory = (subId) => {
    const {list} = this.props;
    const newCategories = [];
    list.categories.map((cat)=> {
      cat.subcategories =  cat.subcategories.filter((sub)=> subId !== sub.id);
      newCategories.push(cat)
      return null
    });
    list.updateCategories(newCategories);
  }

  deleteSubCategoryMessage = (id) => {
    confirmAlert(
      {
        title: 'Confirm to remove',
        message: `Are you sure you want remove "${this.props.Data.name}"`,
        buttons: [{
            label: 'Yes',
            onClick: () => this.removeSubCategory(id)
          },
          { label: 'No'}
        ]
      }
    )
  }

  showEditSubCategoryName = () => {

    this.setState({
      editSubCategoryName: true,
      subCategoryName: this.props.Data.name,
      subCategoryType: this.props.Data.type,
    })
  }

  hideEditSubCategoryName = () => {

    this.setState({
      editSubCategoryName: false,
    })
  }

  handleOnChange = (e) => {
    this.setState({[e.target.id]: e.target.value})
  }

  submitSubCategoryName = (e) => {
    e.preventDefault();
    const {subCategoryName, subCategoryType} = this.state;
    const {list, Data} = this.props;

    list.categories.map((cat)=> {
      cat.subcategories.map( (sub) => {
        if(sub.id === Data.id) {
          sub.name = subCategoryName;
          sub.type = subCategoryType;
        }
        return null
      })

      return null
    });
    list.updateCategories(list.categories)
    this.hideEditSubCategoryName()
  }

  render() {
    const {editSubCategoryName, subCategoryName, subCategoryType} = this.state;
    const {Data ,chosenSubCategory , subCategoryHover, dev_mode} = this.props;
    return(
      <div>
        { !editSubCategoryName && <div className={styles.sub_category}>
          <div
            className={
              classNames(styles.sub_category_name,
                {[styles.sub_category_name_hover]: (subCategoryHover === Data.name) || (chosenSubCategory === Data.name)})
              }
            onClick={()=>this.onChoseSubCategory(Data)}
            onMouseEnter={()=>this.props.onHoverSubCategory(Data.name)}
            onMouseLeave={()=>this.props.unHoverSubCategory(Data.name)}
            >
            <img style={{paddingRight: '4px'}} width="20" height="20" src={typesIcon(Data.type ,Data.icon)} alt="placeholder" />
            <span>{Data.name}</span>
          </div>

          {dev_mode && <div className={styles.sub_category_icon}>
            <img onClick={this.showEditSubCategoryName} src={editIcon} alt="edit sub category"/>
            <img onClick={()=>this.deleteSubCategoryMessage(Data.id)}  src={deleteIcon} alt="delete sub category"/>
          </div>}
        </div>}
        {editSubCategoryName && <form onSubmit={this.submitSubCategoryName} className={styles.sub_category_form}>
          <label htmlFor="subCategoryName">Name</label>
          <input onChange={this.handleOnChange} id="subCategoryName" name="subCategoryName" className={styles.sub_category_input}  value={subCategoryName}/>
          <label htmlFor="subCategoryType">Type</label>
          <input onChange={this.handleOnChange} id="subCategoryType" className={styles.sub_category_input}  value={subCategoryType}/>
          <button type="submit" className={styles.sub_category_submit} >Save</button>
          <button onClick={this.hideEditSubCategoryName} className={styles.sub_category_cancel}>Cancel</button>
        </form>}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dev_mode: state.notifications.dev_mode,
    chosenCategory: state.notifications.chosenCategory,
    chosenSubCategory: state.notifications.chosenSubCategory,
    list: state.categories_list,
    subCategoryHover: state.notifications.subCategoryHover,
  }
}

export default connect(mapStateToProps, {choseSubCategory, onHoverSubCategory, unHoverSubCategory})(SubCategory);
