import React, {Component} from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {choseSubCategory, onHoverSubCategory, unHoverSubCategory} from '../redux/actions/notifications';
import SubCategory from '../SubCategory';
import styles from "./category.module.scss";

class Category extends Component {

  getSubCategories = (subCategories) => {
    const {chosenSubCategory, subCategoryHover, onHoverSubCategory, unHoverSubCategory} = this.props
    return subCategories.map((item,i)=> (
      <SubCategory
        key={i}
        Data={item}
        subCategoryHover={subCategoryHover}
        chosenSubCategory={chosenSubCategory}
        onChoseSubCategory={this.onChoseSubCategory}
        onHover={onHoverSubCategory}
        unHover={unHoverSubCategory}/>)
    )
  }

  onChoseSubCategory = async (name, horizontalCoordinates) => {
    this.props.choseSubCategory(name);
    window.rotateToSpot(horizontalCoordinates)
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
