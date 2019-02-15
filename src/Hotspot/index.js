import React from 'react';
import classNames from 'classnames';
import styles from './hotspot.module.scss';
import {typesIcon} from '../types_icon';


const Hotspot = ({ data, chosenSubCategory, subCategoryHover, onChoseSubCategory, onHover, unHover, rotateDone}) => (

  <div  className={classNames(
      styles.Hotspot,
      {[styles.Hotspot_shine]: (data.name === chosenSubCategory) && rotateDone}
    )}
    style={{
      top: data.screenCoordinates.top-85+'px',
      left: data.screenCoordinates.left-11+'px',
      visibility: data.screenCoordinates.top && data.screenCoordinates.left ? 'visible' : 'hidden',
      }}
    >
    <div
      className={styles.Hotspot_details}
      onClick={()=> onChoseSubCategory(data)}
      onMouseEnter={()=>onHover(data.name)}
      onMouseLeave={()=>unHover(data.name)}
    >
      <img src={typesIcon(data.type, data.icon)} alt="placeholder" className={styles.Hotspot_icon} />
      {((data.name === subCategoryHover) || (data.name === chosenSubCategory)) &&
        <div className={styles.Hotspot_title}>{data.name}</div>}
    </div>
    <div className={styles.Hotspot_line}></div>
  </div>
);

export default Hotspot;
