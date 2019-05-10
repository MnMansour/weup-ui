import * as constants from '../constants/categories';

export default function categories(state = {}, action = {}) {
  switch (action.type) {


    case constants.CATEGORIES_UPDATED:
      return {...state, categories: action.payload.categories, updateCategories: action.payload.updateCategories, screenCenter: action.payload.screenCenter}

    default:
      return state;
  }
}
