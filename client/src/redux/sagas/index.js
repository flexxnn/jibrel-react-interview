import { all } from 'redux-saga/effects'

import appStateSaga from './AppStateSaga';
import restClientSaga from './RestClientSaga';

export default function* rootSaga() {
    yield all([
        appStateSaga(),
        restClientSaga()
    ]);
}
