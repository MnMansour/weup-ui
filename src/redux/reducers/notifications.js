import * as constants from '../constants/notifications';

export default function notifications(state = {}, action = {}) {
  switch (action.type) {

    case constants.CATEGORY_CHOSEN:
      return {...state, chosenCategory: action.payload};

    case constants.SUB_CATEGORY_CHOSEN:
      return {...state, chosenSubCategory: action.payload, rotateDone:false};

    case constants.SUB_CATEGORY_HOVER:
      return {...state, subCategoryHover: action.payload};

    case constants.SUB_CATEGORY_UN_HOVER:
      return {...state, subCategoryHover: null};

    case constants.ROTATE_UPDATED:
      return {...state, rotateDone: action.payload};

    default:
      return state;
  }
}
