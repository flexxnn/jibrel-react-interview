import { all, put, call, select, 
        getContext, setContext, cancelled, 
        fork, take, cancel } from 'redux-saga/effects'        
import { delay, channel, buffers } from 'redux-saga';
import { logger } from '../../utils';
import { selectItemsArray, selectItem } from '../StateSelectors';

import uuid from 'uuid/v4';

import actions from '../actions';
import config from '../../config.yaml';

import LIB from './lib';
const { /* restAPICall, */ restAPICallCancellable, restAPIInit } = LIB;

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

const MAX_CHECK_PARALLEL = (Number(checkerConf.parallelTasksCount) > 0) ? Number(checkerConf.parallelTasksCount) : 1;
const CHECKER_TIMEOUT = Number(checkerConf.timeoutBetweenRequests);
const PUSHER_TIMEOUT = Number(pusherConf.timeoutBetweenRequests);
const CHECKER_THROTTLE = Number(checkerConf.itemUpdateThrottle);
const MAX_ITEMS_PER_CHECK = Number(checkerConf.maxItemsPerCheck);

function getItemData() {
    const items = [];
    for (let i = 0; i < Math.random()*900 + 10; i++)
        items.push(uuid())
    return { abc: Math.random()*1000, items };
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

// just debug
// @todo: remove it
let ch = 0;

function* itemUpdateThread(chan) {
    const chnum = ch++;
    log('task created ', chnum);
    try {
        while (true) {
            // log('check '+chnum+' '+id);
            const id = yield take(chan);

            const result = yield call(restAPICallCancellable, {
                methodName: 'getItem',
                requestPayload: { id },
                // successAction: restItemUpdate,
                errorAction: (e) => {
                    if (e && e.res && e.res.code !== 'NETWORK_ERROR')
                        return restItemUpdateError(e);
                }
            });

            if (result) {
                const item = yield select(state => selectItem(state, result.req.id));
                if (result.res.status !== item.status) {
                    yield put(restItemUpdate(result));
                }
            }

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
            const allItems = yield select(selectItemsArray);
            let pendingItems = allItems.filter(requestFilter);

            // if we don't have items to check
            if (pendingItems.length === 0) {
                yield delay(1);
                continue;
            }

            if (MAX_ITEMS_PER_CHECK && pendingItems.length > MAX_ITEMS_PER_CHECK)
                pendingItems = pendingItems.slice(0, MAX_ITEMS_PER_CHECK);
        
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
