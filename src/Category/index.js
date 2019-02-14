import React, {Component} from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import {choseSubCategory, onHoverSubCategory, unHoverSubCategory} from '../redux/actions/notifications';
import SubCategory from '../SubCategory';
import styles from "./category.module.scss";

class Category extends Component {

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
    const {chosenSubCategory, subCategoryHover, onHoverSubCategory, unHoverSubCategory} = this.props;

    return subCategories.map((item,i)=> {
      if(item.type === type ) {
        return (
          <SubCategory
            key={i}
            Data={item}
            subCategoryHover={subCategoryHover}
            chosenSubCategory={chosenSubCategory}
            onChoseSubCategory={this.onChoseSubCategory}
            onHover={onHoverSubCategory}
            unHover={unHoverSubCategory}/>
          )
        }
        return null
      }
    )
  }

  onChoseSubCategory = async (subcategory) => {
    this.props.choseSubCategory(subcategory.name);
    subcategory.rotateToMe();
  }

  render() {
    const {Data:{name, subcategories}, chosenCategory, onChoseCategory} = this.props
    const getSubCategories = this.getSubCategories(subcategories)
    return(
      <div className={ classNames({[styles.open_category] : chosenCategory === name})} >
        <div onClick={()=>onChoseCategory(name)} className={styles.category_name}>{name}</div>
        <div className={classNames(styles.sub_categories ,{[styles.hide] : chosenCategory !== name})}>
          {getSubCategories}
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    chosenCategory: state.notifications.chosenCategory,
    chosenSubCategory: state.notifications.chosenSubCategory,
    subCategoryHover: state.notifications.subCategoryHover,
  }
}

export default connect(mapStateToProps, {choseSubCategory, onHoverSubCategory, unHoverSubCategory})(Category);
