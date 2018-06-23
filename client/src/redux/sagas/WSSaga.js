import { all, put, call, select, race, actionChannel,
    getContext, setContext, cancelled, 
    fork, take, cancel } from 'redux-saga/effects'        
import { delay, eventChannel } from 'redux-saga';
import { uuid } from 'uuid/v4';

import { logger } from '../../utils';
import actions from '../actions';
import config from '../../config.yaml';

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

const SOCKET_SEND = 'SOCKET_SEND';

const ADDED_TO_QUEUE = 'ADDED_TO_QUEUE';
const STATUS_UPDATED = 'STATUS_UPDATED';

const [ log, error ] = logger('WSSaga');

function watchMessages(socket) {
    return eventChannel((emit) => {
        socket.onopen = () => {
            log('connection established');
            emit({ open: true });
        };
        socket.onmessage = (msg) => {
            log('on message '+msg);
            const message = JSON.parse(msg);
            emit({ message });
        };
        socket.onerror = (err) => {
            log('socket error', err);
            emit({ error: true, err });
        };
        socket.onclose = () => {
            log('socket closed');
            emit({ close: true });
        };
        return () => {
            socket.close();
        }
    });
}

function* internalListener({ socket, sendChannel }) {
    try {
        while (true) {
            const { payload } = yield take(sendChannel);
            log('send: ', payload);
            if (socket.readyState === 1) // The connection is open and ready to communicate
                socket.send(JSON.stringify(payload));
        }
    } finally {
        if (yield cancelled())
            log('cancelled internalListener');
    }
}

function* send({ messageName, payload, sessionBuffer,
        actionToCall = null, actionPayload = {}}) {
    const msg = {
        cb: uuid(),
        name: messageName,
        payload
    };
    
    sessionBuffer[msg.cb] = { msg, 
        actionToCall, 
        actionPayload 
    };

    yield put({ type: SOCKET_SEND, payload: msg });
}

function* externalListener({ socket, recvChannel, sessionBuffer }) {
    try {
        while (true) {
            const msg = yield take(recvChannel);
            log('externalListener', msg);

            // catch connection error and exit from externalListener
            // it will cancel internalListener too (see race doc)
            if (msg.error || msg.close)
                return;

            if (msg.open) {

            }

            if (msg.message) {
                const message = msg.message;
                switch(message) {
                    case 'ADDED_TO_QUEUE': {
                        break;
                    }

                    case 'STATUS_UPDATED': {
                        break;
                    }

                    default:
                        if (sessionBuffer[message]) {
                            if (sessionBuffer[message].actionToCall) {
                                yield put(sessionBuffer[message].actionToCall({ 
                                    res: msg.payload,
                                    req: sessionBuffer[message].msg,
                                    messageName: sessionBuffer[message].name
                                }));
                            }
                            delete sessionBuffer[message];
                        }
                        break;
                }
            }
        }
    } finally {
        if (yield cancelled())
            log('cancelled externalListener');
    }
}

function* socketTask() {
    let socket, recvChannel, sendChannel;
    let sessionBuffer = {};
    try {
        while (true) {
            socket = new WebSocket(config.WebsocketClient.url, 'echo-protocol');
            log(socket);
            recvChannel = yield call(watchMessages, socket);
            sendChannel = yield actionChannel(SOCKET_SEND);
            
            yield race([
                call(externalListener, { socket, recvChannel, sendChannel, sessionBuffer }), 
                call(internalListener, { socket, recvChannel, sendChannel, sessionBuffer })
            ]);

            recvChannel.close();

            // reconnect timeout
            yield delay(config.WebsocketClient.reconnectTimeout);
        }
    } finally {
        if (yield cancelled()) {
            socket.close(4000, APPLICATION_DIS);
            recvChannel.close();
            log('cancelled socketTask');
        }
        sessionBuffer = null;
    }
}

export default function* wsSaga() {
    while (true) {
        yield take(APPLICATION_EN);
        try {
            const task = yield fork(socketTask);
            
            yield take(APPLICATION_DIS);

            task.cancel();
        } catch (e) {
            yield put(APPLICATION_DIS);
            error(e);
        }
    }
};

