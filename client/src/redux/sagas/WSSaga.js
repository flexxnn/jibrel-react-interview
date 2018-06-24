import { all, put, call, select, race, actionChannel,
    getContext, setContext, cancelled, 
    fork, take, cancel } from 'redux-saga/effects'        
import { delay, eventChannel } from 'redux-saga';
import uuid from 'uuid/v4';

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

function pingAction({message, req, res}){
    console.log(req, res, message);
    return {
        type: 'ACTION_PING'
    }
}

function watchMessages(socket) {
    return eventChannel((emit) => {
        socket.onopen = () => {
            log('connection established');
            emit({ open: true });
        };
        socket.onmessage = (msg) => {
            log('on message '+msg.data);
            try {                
                const data = JSON.parse(msg.data);
                emit({ data });
            } catch (e) {
                error(`can't parse JSON ${msg.data}`);
            }
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

function* sendListener({ socket, sendChannel }) {
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

function* send({ message, payload, sessionBuffer,
        actionToCall = null, actionPayload = {}}) {
    const msg = {
        message,
        payload
    };
    if (actionToCall) {
        msg['cb'] = `${message}:RESPONSE:${uuid()}`;
        sessionBuffer[msg.cb] = { msg, 
            actionToCall, 
            actionPayload 
        };
    }
    log('send', msg);
    yield put({ type: SOCKET_SEND, payload: msg });
}

function* recvListener({ recvChannel, sessionBuffer }) {
    try {
        while (true) {
            const msg = yield take(recvChannel);
            log('recvListener', msg);

            // catch connection error and exit from externalListener
            // it will cancel internalListener too (see race doc)
            if (msg.error || msg.close)
                return;

            if (msg.open) {
                yield send({
                    sessionBuffer,
                    message: 'echo.ping',
                    payload: { a: 1 },
                    actionToCall: pingAction
                });
            }

            if (msg.data) {
                const messageName = msg.data.message;
                switch(messageName) {
                    case 'ADDED_TO_QUEUE': {
                        break;
                    }

                    case 'STATUS_UPDATED': {
                        break;
                    }

                    default:
                        if (sessionBuffer[messageName]) {
                            yield put(sessionBuffer[messageName].actionToCall({ 
                                res: msg.data.payload,
                                req: sessionBuffer[messageName].msg,
                                message: sessionBuffer[messageName].msg.message,
                                ...sessionBuffer[messageName].actionPayload
                            }));
                            delete sessionBuffer[messageName];
                        }
                        break;
                }
            }
        }
    } finally {
        if (yield cancelled())
            log('cancelled recvListener');
    }
}

function* socketTask() {
    let socket, recvChannel, sendChannel, sessionBuffer;    
    try {
        while (true) {
            sessionBuffer = {};
            socket = new WebSocket(config.WebsocketClient.url, 'echo-protocol');
            recvChannel = yield call(watchMessages, socket);
            sendChannel = yield actionChannel(SOCKET_SEND);
            
            yield race([
                call(recvListener, { socket, recvChannel, sendChannel, sessionBuffer }), 
                call(sendListener, { socket, recvChannel, sendChannel, sessionBuffer })
            ]);

            recvChannel.close();
            sendChannel.close();

            // reconnect timeout
            yield delay(config.WebsocketClient.reconnectTimeout);
        }
    } finally {
        if (yield cancelled()) {
            socket.close(4000, APPLICATION_DIS);
            recvChannel.close();
            sendChannel.close();
            log('cancelled socketTask');
        }
    }
}

export default function* wsSaga() {
    yield setContext({ sessionName: uuid() });

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

