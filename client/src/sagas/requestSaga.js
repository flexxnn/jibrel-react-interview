import { all, put, takeEvery, select } from 'redux-saga/effects'
import { logger } from '../utils';
import actions from '../actions';

// eslint-disable-next-line
const [ log ] = logger('requestSaga');

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

function* onApplicationEn() {
    // const state = yield select(state => state.applicationState);
    log('onApplicationEn');
    // make the request to the server
    
}

function* onApplicationDis() {
    log('onApplicationDis');
    
}

export function* requestSaga() {
    yield all([
        yield takeEvery(APPLICATION_EN, onApplicationEn),
        yield takeEvery(APPLICATION_DIS, onApplicationDis)
    ]);    
}
