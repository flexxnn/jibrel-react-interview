import { all } from 'redux-saga/effects'

import { applicationStateSaga } from './applicationStateSaga';
import { requestSaga } from './requestSaga';

export default function* rootSaga() {
    yield all([
        applicationStateSaga(),
        requestSaga()
    ])
}
