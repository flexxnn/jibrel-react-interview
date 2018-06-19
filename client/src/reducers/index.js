import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
// import thunkMiddleware from 'redux-thunk';
// import persistState from 'redux-localstorage';
import createHistory from 'history/createBrowserHistory';
import createSagaMiddleware from 'redux-saga';

import { routerReducer, routerMiddleware } from 'react-router-redux';

import rootSaga from './../sagas';

import * as appState from './appState';
import * as requests from './requests';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createHistory();
export const sagaMiddleware = createSagaMiddleware(rootSaga);
const routerHistoryMiddleware = routerMiddleware(history);
const store = createStore(
    combineReducers({
        ...appState,
        ...requests,
        router: routerReducer
    }),
    composeEnhancers(
        applyMiddleware(routerHistoryMiddleware),
        applyMiddleware(sagaMiddleware)
        // persistState(['appearance'])
    )
);
sagaMiddleware.run(rootSaga);

export default store;
