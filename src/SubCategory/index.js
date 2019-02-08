import React from 'react';
import classNames from 'classnames';
import styles from "./sub_category.module.scss";

import placeholder from '../assets/icons/placeholder.jpg';

const SubCategory = ({Data ,chosenSubCategory , subCategoryHover, onChoseSubCategory, onHover, unHover}) => (
  <div
    className={
      classNames(styles.sub_category_name,
        {[styles.sub_category_name_hover]: (subCategoryHover === Data.name) || (chosenSubCategory === Data.name)})
      }
    onClick={()=>onChoseSubCategory(Data)}
    onMouseEnter={()=>onHover(Data.name)}
    onMouseLeave={()=>unHover(Data.name)}
  >
    <img style={{paddingRight: '4px'}} width="20" height="20" src={Data.icon ? Data.icon : placeholder} alt="placeholder" />
    {Data.name}
  </div>
)

export default SubCategory;
