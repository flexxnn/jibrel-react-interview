import { put, call, race, actionChannel,
    getContext, setContext, cancelled, 
    fork, take, cancel } from 'redux-saga/effects'        
import { delay, eventChannel, channel, buffers } from 'redux-saga';
import uuid from 'uuid/v4';

import { logger } from '../../../utils';

const WS_SOCKET_SEND = 'WS_SOCKET_SEND';
export const WS_CONNECTION_ESTABLISHED = 'WS_CONNECTION_ESTABLISHED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';

const [ log, error ] = logger('WebsocketSaga');

const connEstablishedAction = () => { 
    return { type: WS_CONNECTION_ESTABLISHED };
};

const disconnetedAction = () => {
    return { type: WS_DISCONNECTED }
}

// helper action for socketSendSync
const socketWaitSyncAction = ({ req, res }) => {
    return {
        type: req.cb,
        payload: res
    };
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
            log('sendListener:', payload);
            if (socket.readyState === 1) // The connection is open and ready to communicate
                socket.send(JSON.stringify(payload));
        }
    } finally {
        if (yield cancelled())
            log('cancelled sendListener');
    }
}

function* recvListener({ recvChannel, sessionBuffer, connEstablishedTaskFn }) {
    const messageChannel = channel(buffers.dropping(10));
    let connEstablishedTask = null;
    try {    
        while (true) {
            const msg = yield take(recvChannel);
            log('recvListener', msg);

            // catch connection error and exit from externalListener
            // it will cancel internalListener too (see race doc)
            if (msg.error || msg.close) {
                if (connEstablishedTask)
                    yield cancel(connEstablishedTask);
                yield put(disconnetedAction());
                return;
            }

            if (msg.open) {
                yield put(connEstablishedAction());
                if (connEstablishedTaskFn)
                    connEstablishedTask = yield fork(connEstablishedTaskFn, messageChannel);
            }

            if (msg.data) {
                const messageName = msg.data.message;
                if (sessionBuffer[messageName]) {                    
                    yield put(sessionBuffer[messageName].callbackAction({ 
                        res: msg.data.payload,
                        req: sessionBuffer[messageName].msg,
                        message: sessionBuffer[messageName].msg.message,
                        ...sessionBuffer[messageName].actionPayload
                    }));
                    delete sessionBuffer[messageName];
                } else {
                    yield put(messageChannel, {
                        message: messageName,
                        payload: msg.data.payload || {}
                    });
                }
            }
        }
    } finally {
        if (yield cancelled())
            log('cancelled recvListener');            
        messageChannel.close();
    }
}

export function* socketSendSync({ message, payload = {}}) {
    const cbActionName = yield socketSend({
        message,
        payload,
        socketWaitSyncAction
    });
    return yield take(cbActionName);
}

export function* socketSend({ message, payload = {},
    callbackAction = null, actionPayload = {}}) 
{
    const sessionBuffer = yield getContext('sessionBuffer');
    const sendChannel = yield getContext('sendChannel');

    if (!sessionBuffer || !sendChannel)
        throw new Error('You should call "send" from task, forked from connEstablishedTask');

    const msg = {
        message,
        payload
    };

    if (callbackAction) {
        msg['cb'] = `${message}:RESPONSE:${uuid()}`;
        sessionBuffer[msg.cb] = { msg, 
            callbackAction, 
            actionPayload 
        };
    }

    log('socketSend', msg);
    yield put(sendChannel, { type: WS_SOCKET_SEND, payload: msg });
    
    return msg['cb'];
}

export function* socketTask({url, reconnectTimeout = 1000, connEstablishedTaskFn = null}) {
    let socket, recvChannel, sendChannel, sessionBuffer;
    try {
        while (true) {
            try {
                sessionBuffer = {};            
                socket = new WebSocket(url, 'echo-protocol');
                // create event channel to pass events from WS to saga
                recvChannel = yield call(watchMessages, socket);
                // sendChannel = yield actionChannel(WS_SOCKET_SEND);
                // It is better, to use 'channel' here, because actionChannel will flood to redux
                sendChannel = yield channel(buffers.dropping(10));
                
                // Pass sessionBuffer and sendChannel to the 'socketSend' function
                // Context only available in the socketTask and child tasks, if it cancelled -> context lost
                yield setContext({ sessionBuffer, sendChannel });

                yield race([
                    call(recvListener, { socket, recvChannel, sendChannel, sessionBuffer, connEstablishedTaskFn }), 
                    call(sendListener, { socket, recvChannel, sendChannel, sessionBuffer })
                ]);
            } catch (e) {
                // catch exception here and reconnect 
                console.error(e);
            }

            // clean resourses
            if (socket)
                socket.close(4001);
            if (recvChannel)
                recvChannel.close();
            if (sendChannel)
                sendChannel.close();

            // reconnect timeout
            yield delay(reconnectTimeout);
        }
    } finally {
        if (yield cancelled()) {
            if (socket)
                socket.close(4000);
            if (recvChannel)
                recvChannel.close();
            if (sendChannel)
                sendChannel.close();

            log('cancelled socketTask');
        }
    }
}
