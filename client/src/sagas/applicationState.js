import { put, takeEvery, select } from 'redux-saga/effects'

import {
    appEnable,
    appDisable
} from '../actions/applicationState';

import { APPLICATION_TOGGLE_STATE } from '../actions/applicationState';

export function* toggleApplicationState() {
    const state = yield select(state => state.applicationState);
    if (state.applicationEnabled)
        yield put(appDisable());
    else
        yield put(appEnable());
}

export function* applicationStateSaga() {
    yield takeEvery(APPLICATION_TOGGLE_STATE, toggleApplicationState);
}
