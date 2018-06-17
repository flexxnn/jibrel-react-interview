import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// import thunkMiddleware from 'redux-thunk';
// import persistState from 'redux-localstorage';
import createHistory from 'history/createBrowserHistory';

import { routerReducer, routerMiddleware } from 'react-router-redux';

import * as appearance from './appearance';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createHistory();
const routerHistoryMiddleware = routerMiddleware(history);
const store = createStore(
    combineReducers({
        ...appearance,
        router: routerReducer
    }),
    composeEnhancers(
        applyMiddleware(routerHistoryMiddleware)
        // persistState(['appearance'])
    )
);

export default store;
