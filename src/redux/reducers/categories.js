import * as constants from '../constants/categories';

export default function categories(state = {}, action = {}) {
  switch (action.type) {


    case constants.CATEGORIES_UPDATED:
      return {...state, categories: action.payload}

    default:
      return state;
  }
}
