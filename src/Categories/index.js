import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Category from '../Category';
import {choseCategory, choseSubCategory} from '../redux/actions/notifications';

import styles from "./categories.module.css";
import expandLess from '../assets/icons/expand_less.svg';
import expandMore from '../assets/icons/expand_more.svg';
import filterList from '../assets/icons/filter_list.svg';

class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideFilters: false,
    };
  }

  getCategoriesList = (data) => {
    if (data.categories){
      return data.categories.map((item, i) => (
        <Category
          key={i}
          Data={item}
          onChoseCategory={this.choseCategory}
        />
      ));
    } else {return null}
  }

  choseCategory = (newChosen) => {
    if (this.props.chosenCategory !== newChosen){
      this.props.choseCategory(newChosen)
    } else {
      this.props.choseCategory(null)
      this.props.choseSubCategory(null)
    }

  }

  componentDidMount() {
    const {list, choseCategory} = this.props

    if(!this.state.hideFilters){
      if (list.categories) choseCategory(list.categories[0].name);
    }
  }

  componentDidUpdate(prevProps, prevState) {
  }


  toggleFilters = () => {
    this.setState({hideFilters: !this.state.hideFilters})

    if (!this.state.hideFilters) {
      this.props.choseCategory(null)
      this.props.choseSubCategory(null)
    }
  }


  render() {
    const {hideFilters} = this.state;
    const categories_list = this.getCategoriesList(this.props.list);
    return (
      <div className={classNames(styles.Categories,{[styles.Categories_open] : !hideFilters})} >
        <div className={styles.categories_header} onClick={this.toggleFilters}>
          <img src={filterList} alt="filter"/>
          <span className={styles.categories_header_title}>Filtering menu</span>
          <img src={hideFilters ? expandMore : expandLess} alt="expand"/>
        </div>
        {!hideFilters && <div className={styles.categories_menu}>
          {categories_list}
        </div>}
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    chosenCategory: state.notifications.chosenCategory,
    list: state.categories_list,
  }
}

export default connect(mapStateToProps, {choseCategory, choseSubCategory}) (Categories);
