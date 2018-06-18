import { put, takeEvery, select } from 'redux-saga/effects'

import actions from '../actions';
const {
    APPLICATION_TOGGLE_STATE,
    appEnable,
    appDisable
} = actions;

function* toggleApplicationState() {
    const state = yield select(state => state.applicationState);
    if (state.applicationEnabled)
        yield put(appDisable());
    else
        yield put(appEnable());
}

export function* applicationStateSaga() {
    yield takeEvery(APPLICATION_TOGGLE_STATE, toggleApplicationState);
}
