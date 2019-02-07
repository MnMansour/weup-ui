import React from 'react';
import classNames from 'classnames';
import styles from "./sub_category.module.scss";

import placeholder from '../assets/icons/placeholder.jpg';

const SubCategory = ({Data:{name, icon, horizontalCoordinates},chosenSubCategory , subCategoryHover, onChoseSubCategory, onHover, unHover}) => (
  <div
    className={
      classNames(styles.sub_category_name,
        {[styles.sub_category_name_hover]: (subCategoryHover === name) || (chosenSubCategory === name)})
      }
    onClick={()=>onChoseSubCategory(name, horizontalCoordinates)}
    onMouseEnter={()=>onHover(name)}
    onMouseLeave={()=>unHover(name)}
  >
    <img style={{paddingRight: '4px'}} width="20" height="20" src={icon ? icon : placeholder} alt="placeholder" />
    {name}
  </div>
)

export default SubCategory;
