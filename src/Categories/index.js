import React, { Component } from "react";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Category from '../Category';
import {choseCategory, choseSubCategory, enableDevMode} from '../redux/actions/notifications';

import styles from "./categories.module.scss";
import expandLess from '../assets/icons/expand_less.svg';
import expandMore from '../assets/icons/expand_more.svg';
import filterList from '../assets/icons/filter_list.svg';
import add_circle from '../assets/icons/add_circle_outline.svg';

class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideFilters: false,
      categoryInput: false,
      newCat: ''
    };
  }

  getCategoriesList = (data) => {
    if (data.categories){
      return data.categories.map((item, i) =>(
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

  // Run Dev mode on ctrl + shift + d

  keydownHandler = (e) => {
    if(e.shiftKey && e.ctrlKey && e.keyCode === 68) this.toggleDevMode();
  }

  componentDidMount() {
    const {list, choseCategory} = this.props

    if(!this.state.hideFilters){
      if (list.categories) choseCategory(list.categories[0].name);
    }

    document.addEventListener('keydown',this.keydownHandler);
  }

  componentWillUnmount(){
    document.removeEventListener('keydown',this.keydownHandler);
  }

  toggleFilters = () => {
    this.setState({hideFilters: !this.state.hideFilters})

    if (!this.state.hideFilters) {
      this.props.choseCategory(null)
      this.props.choseSubCategory(null)
    }
  }

  toggleDevMode = () => {
    if(this.props.dev_mode) {
      this.props.enableDevMode(false);
    } else this.props.enableDevMode(true) ;
  }

  showCategoryInput = () => {
    this.setState({categoryInput: true});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { newCat } = this.state;
    const {list} = this.props;

    const newCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCat,
      subcategories: []
    };

    if (newCat) {
      list.categories.push(newCategory);
    }
    this.setState({categoryInput: false, newCat: ''});
  }

  handleOnChange = (e) => {
    this.setState({newCat: e.target.value})
  }

  render() {
    const {hideFilters, categoryInput, newCat} = this.state;
    const categories_list = this.getCategoriesList(this.props.list);
    return (
      <div className={classNames(styles.Categories,{[styles.Categories_open] : !hideFilters})} >
        <div className={styles.categories_header}>
          <img onClick={this.toggleFilters} src={filterList} alt="filter"/>
          <h5 className={styles.categories_header_title}>Filtering menu</h5>
          {this.props.dev_mode && <img onClick={this.showCategoryInput} src={add_circle} alt="add_circle"/>}
          <img onClick={this.toggleFilters} src={hideFilters ? expandMore : expandLess} alt="expand"/>
        </div>
        {!hideFilters && <div className={styles.categories_menu}>
          {categories_list}
        </div>}
        {this.props.dev_mode && categoryInput &&
          <form onSubmit={this.handleSubmit} className={styles.category_input}>
            <input onChange={this.handleOnChange} value={newCat}/>
            <button>Add Category</button>
          </form>}
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    dev_mode: state.notifications.dev_mode,
    chosenCategory: state.notifications.chosenCategory,
    list: state.categories_list,
  }
}

export default connect(mapStateToProps, {choseCategory, choseSubCategory, enableDevMode}) (Categories);
