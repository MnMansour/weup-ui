import * as constants from '../constants/notifications';

export function choseCategory(v) {
  return (dispatch) => {
    dispatch({
      type: constants.CATEGORY_CHOSEN,
      payload: v
    });
  }
}

export function choseSubCategory(v) {
  return (dispatch) => {

    dispatch({
      type: constants.SUB_CATEGORY_CHOSEN,
      payload: null
    });
    setTimeout(()=> {
      dispatch({
        type: constants.SUB_CATEGORY_CHOSEN,
        payload: v
      });
    },100)
  }
}

export function onHoverSubCategory(v) {
  return (dispatch) => {
    dispatch({
      type: constants.SUB_CATEGORY_HOVER,
      payload: v
    });
  }
}

export function unHoverSubCategory() {
  return (dispatch) => {
    dispatch({
      type: constants.SUB_CATEGORY_UN_HOVER,
    });
  }
}
