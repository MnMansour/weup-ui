import React from 'react';
import classNames from 'classnames';
import styles from './hotspot.module.scss';
import {typesIcon} from '../types_icon';


const Hotspot = ({ data:{name, icon, type, screenCoordinates, horizontalCoordinates}, chosenSubCategory, subCategoryHover, onChoseSubCategory, onHover, unHover, rotateDone}) => (

  <div  className={classNames(
      styles.Hotspot,
      {[styles.Hotspot_shine]: (name === chosenSubCategory) && rotateDone}
    )}
    style={{
      top: screenCoordinates.top-85+'px',
      left: screenCoordinates.left-11+'px',
      visibility: screenCoordinates.top && screenCoordinates.left ? 'visible' : 'hidden',
      }}
    >
    <div
      className={styles.Hotspot_details}
      onClick={()=> onChoseSubCategory(name, horizontalCoordinates)}
      onMouseEnter={()=>onHover(name)}
      onMouseLeave={()=>unHover(name)}
    >
      <img src={typesIcon(type, icon)} alt="placeholder" className={styles.Hotspot_icon} />
      {((name === subCategoryHover) || (name === chosenSubCategory)) &&
        <div className={styles.Hotspot_title}>{name}</div>}
    </div>
    <div className={styles.Hotspot_line}></div>
  </div>
);

export default Hotspot;
