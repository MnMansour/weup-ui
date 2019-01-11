import { combineReducers } from 'redux';
import notificationsReducer from './notifications.js';
import categoriesReducer from './categories.js';

export default combineReducers({
	 notifications: notificationsReducer,
	 categories_list: categoriesReducer,
  });
