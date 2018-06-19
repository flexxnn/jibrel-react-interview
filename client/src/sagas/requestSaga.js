import { all, put, call, takeEvery, select, getContext, cancelled, fork, take, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga';
import { logger } from '../utils';
import actions from '../actions';

// eslint-disable-next-line
const [ log ] = logger('requestSaga');

const {
    APPLICATION_EN,
    APPLICATION_DIS,
    restItemPostStart,
    restItemPostSuccess,
    restItemPostError
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
                const item = yield call([rest, rest.apis.all.postItem], {}, {
                    requestBody: { requestPayload: itemData }
                });
                log('success', item);
                yield put(restItemPostSuccess(item.body));
            } catch (e) {
                log('error', e);
                yield put(restItemPostError(e));
            }
            yield call(delay, 1000);
        }
    } finally {
        if (yield cancelled()) {
            log('task canceled');
        }
    }
}

function* onApplicationEn() {
    log('onApplicationEn');
    
    // starts the task in the background
    const bgTask = yield fork(makeRequestsTask);
    
    // wait for the user stop action
    yield take(APPLICATION_DIS);

    // user clicked stop. cancel the background task
    // this will cause the forked bgSync task to jump into its finally block
    yield cancel(bgTask)
}

export function* requestSaga() {
    yield all([
        yield takeEvery(APPLICATION_EN, onApplicationEn),
        // yield takeEvery(APPLICATION_DIS, onApplicationDis)
    ]);
}
