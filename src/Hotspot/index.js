import React from 'react';
import classNames from 'classnames';
import styles from './hotspot.module.css';

import placeholder from '../assets/icons/placeholder.jpeg';


const Hotspot = ({ data:{name, screenCoordinates, horizontalCoordinates}, chosenSubCategory, subCategoryHover, onChoseSubCategory, onHover, unHover, rotateDone}) => (
  <div  className={classNames(
      styles.Hotspot,
      {[styles.Hotspot_shine]: (name === chosenSubCategory) && rotateDone}
    )}
    style={{
      top: screenCoordinates.top-60+'px',
      left: screenCoordinates.left-60+'px',
      visibility: screenCoordinates.top && screenCoordinates.left ? 'visible' : 'hidden',
      }}
    >
    <div
      className={styles.Hotspot_details}
      onClick={()=> onChoseSubCategory(name, horizontalCoordinates)}
      onMouseEnter={()=>onHover(name)}
      onMouseLeave={()=>unHover(name)}
    >
      <img src={placeholder} alt="placeholder" className={styles.Hotspot_icon} />
      {((name === subCategoryHover) || (name === chosenSubCategory)) &&
        <div className={styles.Hotspot_title}>{name}</div>}
    </div>
    <div className={styles.Hotspot_line}></div>
  </div>
);

export default Hotspot;
