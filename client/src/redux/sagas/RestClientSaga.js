import { all, put, call, select, 
        getContext, setContext, cancelled, 
        fork, take, cancel } from 'redux-saga/effects'        
import { delay, channel, buffers } from 'redux-saga';
import { logger } from '../../utils';

import actions from '../actions';
import config from '../../config.yaml';

import API from './api';
const { /* restAPICall, */ restAPICallCancellable, restAPIInit } = API;

const [ log, error ] = logger('requestSaga');

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    appDisable,
    appSetFatalError,

    restItemPostStart,
    restItemPostSuccess,
    restItemPostError,
    restItemUpdate,
    restItemUpdateError
} = actions;

const {
    checkerConf,
    pusherConf
} = config.RestClient;

const MAX_CHECK_PARALLEL = (checkerConf.parallelTasksCount > 0) ? checkerConf.parallelTasksCount : 1;
const CHECKER_TIMEOUT = checkerConf.timeoutBetweenRequests;
const PUSHER_TIMEOUT = pusherConf.timeoutBetweenRequests;
const CHECKER_THROTTLE = checkerConf.itemUpdateThrottle;

function getItemData() {
    let s = '';
    for (let i = 0; i < 20000; i++)
        s = s + i;
    console.log(s.length);
    return { abc: Math.random()*1000, s };
}

function* makeRequestsTask() {
    try {
        while (true) {
            const itemData = getItemData();
            yield put(restItemPostStart(itemData));
            try {
                yield call(restAPICallCancellable, {
                    methodName: 'postItem',
                    requestPayload: {
                        body: { requestPayload: itemData }
                    },
                    successAction: restItemPostSuccess,
                    errorAction: restItemPostError,
                    throwError: true
                });
            } catch (e) {
                error(e);
                yield delay(1000);
            }

            if (PUSHER_TIMEOUT > 0)
                yield delay(PUSHER_TIMEOUT);
        }
    } finally {
        if (yield cancelled()) {
            log('makeRequestsTask stopped');
        }
    }
}

// just to debug
// @todo: remove it
let ch = 0;

function* itemUpdateThread(chan) {
    const chnum = ch++;
    log('task created ', chnum);
    try {
        while (true) {
            // log('check '+chnum+' '+id);
            const id = yield take(chan);

            yield call(restAPICallCancellable, {
                methodName: 'getItem',
                requestPayload: { id },
                successAction: restItemUpdate,
                errorAction: (e) => (e.res.code !== 'NETWORK_ERROR' && restItemUpdateError(e))
            });

            if (CHECKER_TIMEOUT > 0)
                yield delay(CHECKER_TIMEOUT);
        }
    } finally {
        if (yield cancelled()) {
            log(`itemUpdateThread task stopped CH${chnum}`);
        }
    }
}

function* checkRequestStatusTask() {
    const requestFilter = (item) =>
        (item.type === 'REST' && 
            item.status !== 'success' && 
            item.status !== 'error' && 
            ( !item.updateTimestamp || (Date.now() - item.updateTimestamp) > CHECKER_THROTTLE)
        );
   
    try {
        const buffer = buffers.expanding(1);
        // create a channel to queue incoming requests
        const chan = channel(buffer);
        
        // create 3 worker 'threads'
        for (let i = 0; i < MAX_CHECK_PARALLEL; i++) {
            yield fork(itemUpdateThread, chan);
        }

        // console.log('all forked', threads)
        // console.log('channel', chan)
        // console.log('buffer', buffer);

        while (true) {
            if (!buffer.isEmpty()) {
                yield delay(1);
                continue;
            }

            // get all pending items from queue
            const allItems = yield select(state => state.requests.items);
            const pendingItems = allItems.filter(requestFilter);
            
            // if we don't have items to check
            if (pendingItems.length === 0) {
                yield delay(1);
                continue;
            }
            
            // console.log(pendingItems);
            yield all(pendingItems.map(item => put(chan, item.id)));
            // console.log('all in CH ');
        }
    } finally {
        if (yield cancelled()) {
            log('checkRequestStatusTask stopped');
        }
    }
}

export default function* restClientSaga() {
    while (true) {
        yield take(APPLICATION_EN);
        try {
            if (!(yield getContext('restClient'))) {
                const restClient = yield call(restAPIInit);
                yield setContext({ restClient });
            }

            // starts the tasks in the background
            const bgMakeRequestsTask = yield fork(makeRequestsTask);
            const bgCheckRequestStatusTask = yield fork(checkRequestStatusTask);

            // wait for the user stop action
            yield take(APPLICATION_DIS);

            // user clicked stop. cancel the background task
            // this will cause the forked bgSync task to jump into its finally block
            yield cancel(bgMakeRequestsTask);
            yield cancel(bgCheckRequestStatusTask);
        } catch (e) {
            yield put(appDisable());
            yield put(appSetFatalError(`Fatal error, application stopped. (${e})`));
            error('Error', e)
        }
    }
}
