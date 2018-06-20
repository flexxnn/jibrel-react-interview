import { all, put, call, takeEvery, select, 
            getContext, cancelled, fork, take, cancel, actionChannel } from 'redux-saga/effects'
import { delay, channel, buffers } from 'redux-saga';
import { logger } from '../utils';
import actions from '../actions';

// eslint-disable-next-line
const [ log ] = logger('requestSaga');

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    restItemPostStart,
    restItemPostSuccess,
    restItemPostError,
    restItemUpdate
} = actions;

function getItemData() {
    return { abc: Math.random(1000) };
}

function* makeRequestsTask() {
    try {
        const rest = yield getContext('restClient');
        while (true) {
            const itemData = getItemData();
            yield put(restItemPostStart(itemData));
            try {
                // make swagger request
                const item = yield call([rest, rest.apis.all.postItem], {
                    body: { requestPayload: itemData }
                });
                log('new added', item.body.id);
                yield put(restItemPostSuccess(item.body));
            } catch (e) {
                log('error', e);
                yield put(restItemPostError(e));
            }
            // yield delay(500);
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
    let chnum = ch++;
    log('thread created ',chnum);
    try {
        const rest = yield getContext('restClient');
        while (true) {
            const id = yield take(chan);
            log('check '+chnum+' '+id);
            const item = yield call([rest, rest.apis.all.getItem], { id });
            yield put(restItemUpdate(item.body));
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
            ( !item.updateTimestamp || (Date.now() - item.updateTimestamp) > 1000)
        );
   
    try {
        // create a channel to queue incoming requests
        const buffer = buffers.expanding(1);
        const chan = channel(buffer);
        
        // create 3 worker 'threads'
        for (let i = 0; i < 3; i++) {
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

function* onApplicationEn() {
    log('onApplicationEn');
    
    // starts the tasks in the background
    const bgMakeRequestsTask = yield fork(makeRequestsTask);
    const bgCheckRequestStatusTask = yield fork(checkRequestStatusTask);
    
    // wait for the user stop action
    yield take(APPLICATION_DIS);

    // user clicked stop. cancel the background task
    // this will cause the forked bgSync task to jump into its finally block
    yield cancel(bgMakeRequestsTask);
    yield cancel(bgCheckRequestStatusTask);
}

export default function* restSaga() {
    yield all([
        yield takeEvery(APPLICATION_EN, onApplicationEn)
    ]);
}
