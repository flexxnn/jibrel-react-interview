import { all, put, call, setContext } from 'redux-saga/effects'
import Swagger from 'swagger-client';

import { appStateSaga } from './appStateSaga';
import { requestSaga } from './requestSaga';

import conf from '../config.yaml';

import { appSetStarted, appSetFatalError } from '../actions/appState';

function* initAPI() {    
    try {
        const restClient = yield call(Swagger, { ...conf.Swagger });
        // set context to get restClient everywhere
        yield setContext({ restClient });
        yield put(appSetStarted());

        yield all([
            appStateSaga(),
            requestSaga()
        ]);
    } catch (e) {
        yield put(appSetFatalError(`Can't init swagger. ${e}`));
    }
}

export default function* rootSaga() {
    yield initAPI();
}
