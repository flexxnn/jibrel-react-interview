import { put, select,getContext, setContext, cancelled, fork, take } from 'redux-saga/effects'
import { delay } from 'redux-saga';
import uuid from 'uuid/v4';

import { logger } from '../../utils';
import actions from '../actions';
import config from '../../config.yaml';

import API from './api';
const { socketSend, socketTask } = API;

const CHECKER_THROTTLE = config.WebsocketClient.checkerConf.itemUpdateThrottle;

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    WS_ITEM_POST_SUCCESS,
    WS_ITEM_POST_ERROR,
    WS_ITEM_CHECK,
    wsItemPostAction,
    wsItemUpdateAction,
    wsItemCheckAction
} = actions;

const [ log, error ] = logger('WSSaga');

function getItemData() {
    let s = '';
    for (let i = 0; i < 100; i++)
        s = s + i;
    return { abc: Math.random()*1000, s };
}

// const pingAction = ({message, req, res}) => {
//     console.log(req, res, message);
//     return {
//         type: 'ACTION_PING',
//         payload: res
//     }
// }

function* itemCheckTask() {
    const filter = (item) =>
        (item.type === 'WS' && 
            item.status !== 'success' && 
            item.status !== 'error' && 
            (Date.now() - item.updateTimestamp) > CHECKER_THROTTLE
        );

    try {
        const sessionId = yield getContext('sessionId');
        while(true) {
            // get all pending items from queue
            const allItems = yield select(state => state.requests.items);
            const pendingItems = allItems.filter(filter);
            if (pendingItems.length === 0) {
                // nothing to check
                yield delay(10);
                continue;
            };
            
            for (let i = 0; i < pendingItems.length; i++)
            {
                log(`check ${pendingItems[i].id}`);
                yield socketSend({
                    message: 'items.getItem',
                    payload: { 
                        sessionId,
                        id: pendingItems[i].id
                    },
                    callbackAction: wsItemCheckAction
                });
                yield take(WS_ITEM_CHECK);

                // to prevent slide-show in browser
                yield delay(1); 
            }
        }
    } finally {
        if (yield cancelled())
            log('canceled itemCheckTask');
    }
}

function* itemPostTask() {
    try {
        const sessionId = yield getContext('sessionId');
        while(true) {
            yield socketSend({
                message: 'items.addItem',
                payload: { 
                    sessionId,
                    requestPayload: getItemData()
                },
                callbackAction: wsItemPostAction
            });
            yield take([WS_ITEM_POST_SUCCESS, WS_ITEM_POST_ERROR]);

            // to prevent slide-show in browser
            yield delay(1);
        }
    } finally {
        if (yield cancelled())
            log('canceled itemPostTask');
    }
}

function* connEstablishedTask(messageChannel) {
    log('connEstablishedTask started');
    try {
        yield fork(itemPostTask);
        yield fork(itemCheckTask);

        while(true) {
            const msg = yield take(messageChannel);
            switch (msg.message) {
                case 'ITEM_UPDATED':
                    yield put(wsItemUpdateAction(msg.payload));
                    break;

                default:
                    break;
            }
        }
    } finally {
        if (yield cancelled())
            log('canceled connEstablishedTask');
    }
}

export default function* wsSaga() {
    yield setContext({ sessionId: uuid() });

    while (true) {
        yield take(APPLICATION_EN);
        try {
            const task = yield fork(socketTask, {
                url: config.WebsocketClient.url,
                reconnectTimeout: config.WebsocketClient.reconnectTimeout,
                connEstablishedTaskFn: connEstablishedTask
            });
            
            yield take(APPLICATION_DIS);

            task.cancel();
        } catch (e) {
            yield put(APPLICATION_DIS);
            error(e);
        }
    }
};

