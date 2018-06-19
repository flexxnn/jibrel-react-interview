import { all } from 'redux-saga/effects'

import { applicationStateSaga } from './applicationStateSaga';

export default function* rootSaga() {
    yield all([
        applicationStateSaga()
    ])
}
