import { all } from 'redux-saga/effects'

import appStateSaga from './AppStateSaga';
import restClientSaga from './RestClientSaga';
import wsSaga from './WSSaga';

export default function* rootSaga() {
    yield all([
        appStateSaga(),
        restClientSaga(),
        wsSaga()
    ]);
}
