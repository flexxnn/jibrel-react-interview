import { all } from 'redux-saga/effects'

import { applicationStateSaga } from './applicationState';

export default function* rootSaga() {
    yield all([
        applicationStateSaga()
    ])
}
