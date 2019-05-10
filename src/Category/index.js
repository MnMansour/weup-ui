import React, {Component} from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import { confirmAlert } from 'react-confirm-alert';
import SubCategory from '../SubCategory';
import styles from "./category.module.scss";

import add_circle from '../assets/icons/add_circle_outline.svg';
import editIcon from '../assets/icons/edit.svg';
import deleteIcon from '../assets/icons/delete.svg';

class Category extends Component {

  state = {
    editCategoryName: false,
    categoryName: '',
    addedSubCategoryName: '',
    addedSubCategoryType: '',
    showAddSubCategory: false,
  }

  getSubCategories = (subCategories) => {
    const types = _.uniq(subCategories.map((item)=> item.type));
    return types.map((item,i)=>(
      <div key={i}>
        <div className={styles.type}>{item}</div>
        {this.getSubCategoriesByTypes(item, subCategories)}
      </div>
    ))
  }

  getSubCategoriesByTypes = (type, subCategories) => {

    return subCategories.map((item,i)=> {
      if(item.type === type ) {
        return (
          <SubCategory
            key={i}
            Data={item}
            onChoseSubCategory={this.onChoseSubCategory}
            />
          )
        }
        return null
      }
    )
  }

  showEditCategoryName = () => {
    const {Data:{name}, chosenCategory, onChoseCategory} = this.props
    this.setState({editCategoryName: !this.state.editCategoryName, categoryName: name});
    if(chosenCategory !== name) onChoseCategory(name);
  }

  hideEditCategoryName = () => {
    this.setState({editCategoryName: !this.state.editCategoryName});
  }

  handleOnChange = (e) => {
    this.setState({[e.target.id]: e.target.value})
  }

  submitCategoryName = (event) => {
    event.preventDefault();
    const {categoryName} = this.state;
    const {list, Data:{id}} =this.props;
    if (list) {
       list.categories.map((cat) => {
        if (cat.id === id) {
          cat.name = categoryName
        }
        return null
      });
    }
    this.showEditCategoryName();
  }

  removeCategory = () => {
    const {list, Data:{id}} =this.props;
    if (list) {
      const newCat = list.categories.filter((cat) => cat.id !== id)
      list.updateCategories(newCat);
    }
  }

  deleteCategoryMessage=()=>{
    const {name} = this.props.Data;
    confirmAlert(
      {
        title: 'Confirm to remove',
        message: `Are you sure you want remove "${name} Category"`,
        buttons: [{
            label: 'Yes',
            onClick: () => this.removeCategory()
          },
          { label: 'No'}
        ]
      }
    )
  }

  showNewSubCategoryName = () => {

    this.setState({
      showAddSubCategory: true,
      addedSubCategoryName: '',
      addedSubCategoryType: '',
    })
    const {Data:{name}, chosenCategory, onChoseCategory} = this.props;
    if(chosenCategory !== name) onChoseCategory(name);
  }

  hideNewSubCategoryName = () => {
    this.setState({showAddSubCategory: false})
  }

  submitNewSubCategory = (e) => {
    e.preventDefault();
    const {list, Data} = this.props;
    const {addedSubCategoryName, addedSubCategoryType} = this.state;

    if (addedSubCategoryName && addedSubCategoryType){
      const newSub = {
        name: addedSubCategoryName,
        type: addedSubCategoryType,
        id: Math.random().toString(36).substr(2, 9),
        screenCoordinates: {
          top: 0,
          left: 0
        },
        horizontalCoordinates: {},
        wgsCoordinates: {
          lat: 30.25218,
          lon: 30.758125,
          alt: 20
        },
        data: []
      }
      Data.subcategories.push(newSub)
      list.updateCategories(list.categories);
      this.hideNewSubCategoryName()
    }
  }

  render() {
    const {Data:{name, subcategories}, chosenCategory, onChoseCategory, dev_mode} = this.props
    const getSubCategories = this.getSubCategories(subcategories)
    return(
      <div className={ classNames({[styles.open_category] : chosenCategory === name})} >
        <div className={styles.category_name}>
          {!this.state.editCategoryName && <span className={styles.category_title} onClick={()=>onChoseCategory(name)}>{name}</span>}
          { this.state.editCategoryName && <form onSubmit={this.submitCategoryName}>
            <input className={styles.category_input} id="categoryName" value={this.state.categoryName} onChange={this.handleOnChange}/>
              <button type="submit" className={styles.category_submit} >Save</button>
              <button onClick={this.hideEditCategoryName} className={styles.category_cancel}>Cancel</button>
          </form>}
          {dev_mode && !this.state.editCategoryName && <div className={styles.category_icons}>
            <img onClick={this.showNewSubCategoryName} src={add_circle} alt="add sub category"/>
            <img onClick={this.showEditCategoryName} src={editIcon} alt="edit sub category"/>
            <img onClick={this.deleteCategoryMessage} src={deleteIcon} alt="delete sub category"/>
          </div>}

          {this.state.showAddSubCategory && <form onSubmit={this.submitNewSubCategory} className={styles.sub_category_form}>
            <label htmlFor="addedSubCategoryName">Name</label>
            <input onChange={this.handleOnChange} id="addedSubCategoryName" className={styles.sub_category_input}  value={this.state.addedSubCategoryName}/>
            <label htmlFor="addedSubCategoryType">Type</label>
            <input onChange={this.handleOnChange} id="addedSubCategoryType" className={styles.sub_category_input}  value={this.state.addedSubCategoryType}/>
            <button type="submit" className={styles.sub_category_submit} >Save</button>
            <button onClick={this.hideNewSubCategoryName} className={styles.sub_category_cancel}>Cancel</button>
          </form>}
        </div>
        <div className={classNames(styles.sub_categories ,{[styles.hide] : chosenCategory !== name})}>
          {getSubCategories}
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dev_mode: state.notifications.dev_mode,
    chosenCategory: state.notifications.chosenCategory,
    list: state.categories_list,
  }
}

export default connect(mapStateToProps, null)(Category);
