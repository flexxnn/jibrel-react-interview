import Swagger from 'swagger-client';
import { put, call, getContext } from 'redux-saga/effects'

import conf from '../../../config.yaml';

export function restAPIInit() {    
    return call(Swagger, { ...conf.Swagger });
}

export function* restAPICall({methodName, requestPayload = {}, 
    successAction = null, errorAction = null, throwError = false, actionPayload = {}}) {
    const rest = yield getContext('restClient');
    
    try {
        const result = yield call([rest, rest.apis.all[methodName]], requestPayload);
        const payload = {
            methodName,
            success: true,
            status: result.status,
            req: requestPayload,
            res: result.body || {},
            ...actionPayload
        };
        if (successAction) {
            yield put(successAction(payload));
        }
        yield payload;
    } catch (e) {
        if (errorAction) {
            if (e instanceof TypeError) {
                // network error, failed to fetch
                const payload = {
                    methodName,
                    success: false,
                    status: 0,
                    req: requestPayload,
                    res: { code: 'NETWORK_ERROR', message: e.toString() },
                    ...actionPayload
                };
                yield put(errorAction(payload));
            } else if (e instanceof Error) {
                // REST API server error
                const payload = {
                    methodName,
                    success: false,
                    status: e.status,
                    req: requestPayload,
                    res: (e.response) ? e.response.body : {},
                    ...actionPayload
                };
                yield put(errorAction(payload));
            }
        }
        if (throwError)
            throw e;
    }
}

