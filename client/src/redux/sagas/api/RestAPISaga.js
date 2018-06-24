import { put, call, getContext } from 'redux-saga/effects'
import { CANCEL } from 'redux-saga';

import Swagger from 'swagger-client';
import axios from 'axios';

import conf from '../../../config.yaml';

function fetchAPI(req) {
    const source = axios.CancelToken.source();
    const params = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        cancelToken: source.token
    };
    if (req.body)
        params['data'] = req.body;

    const request = axios(params);
    request[CANCEL] = () => {
        source.cancel();
        console.log(`cancel axios request ${req.url}`);
    };
    return request;
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
        return payload;
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
                const res = errorAction(payload);
                if (res && res.type)
                    yield put(res);
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
                const res = errorAction(payload);
                if (res && res.type)
                    yield put(res);
            }
        }
        if (throwError)
            throw e;
    }
}

export function* restAPICallCancellable({methodName, requestPayload = {}, 
    successAction = null, errorAction = null, throwError = false, actionPayload = {}}) {
    const rest = yield getContext('restClient');
    try {
        const req = yield call([Swagger, 'buildRequest'], {
            spec: rest.spec,
            operationId: methodName,
            parameters: requestPayload
        });
        
        const result = yield call(fetchAPI, req);
        const payload = {
            methodName,
            success: true,
            status: result.status,
            req: requestPayload,
            res: result.data || {},
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
                const res = errorAction(payload);
                if (res && res.type)
                    yield put(res);
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
                const res = errorAction(payload);
                if (res && res.type)
                    yield put(res);
            }
        }
        if (throwError)
            throw e;
    }
}

export function* restAPIInit() {
    const swagger = yield call(Swagger, { ...conf.Swagger });    
    return swagger;
}
