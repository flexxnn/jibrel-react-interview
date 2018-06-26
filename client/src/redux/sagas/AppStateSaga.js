import { put, takeEvery, select } from 'redux-saga/effects'

import { selectAppState } from '../StateSelectors';

import actions from '../actions';
const {
    APPLICATION_TOGGLE_STATE,
    appEnable,
    appDisable
} = actions;

function* toggleApplicationState() {
    const state = yield select(selectAppState);
    if (state.applicationEnabled)
        yield put(appDisable());
    else
        yield put(appEnable());
}

export default function* appStateSaga() {
    yield takeEvery(APPLICATION_TOGGLE_STATE, toggleApplicationState);
}
