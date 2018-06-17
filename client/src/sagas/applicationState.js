import { put, takeEvery, select } from 'redux-saga/effects'

import { 
    APPLICATION_EN,
    APPLICATION_DIS,
    APPLICATION_TOGGLE_STATE } from '../actions/applicationState';

export function* toggleApplicationState() {
    const state = yield select(state => state.applicationState);
    if (state.applicationEnabled)
        yield put({ type: APPLICATION_DIS });
    else
        yield put({ type: APPLICATION_EN })
}
  
export function* applicationStateSaga() {
    yield takeEvery(APPLICATION_TOGGLE_STATE, toggleApplicationState);
}
