import { all, put, call, select, race, actionChannel,
    getContext, setContext, cancelled, 
    fork, take, cancel } from 'redux-saga/effects'        
import { delay, eventChannel, channel, buffers } from 'redux-saga';
import uuid from 'uuid/v4';

import { logger } from '../../utils';
import actions from '../actions';
import config from '../../config.yaml';

const {
    APPLICATION_EN,
    APPLICATION_DIS
} = actions;

const SOCKET_SEND = 'SOCKET_SEND';
const CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED';
const DISCONNECTED = 'DISCONNECTED';

const [ log, error ] = logger('WSSaga');

function pingAction({message, req, res}){
    console.log(req, res, message);
    return {
        type: 'ACTION_PING'
    }
}

const connEstablishedAction = () => { 
    return { type: CONNECTION_ESTABLISHED };
};

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
                return;
            }

            if (msg.open) {
                yield put(connEstablishedAction());
                if (connEstablishedTaskFn)
                    connEstablishedTask = yield fork(connEstablishedTaskFn, messageChannel);
                
                // yield send({
                //     sessionBuffer,
                //     message: 'echo.ping',
                //     payload: { a: 1 },
                //     actionToCall: pingAction
                // });
            }

            if (msg.data) {
                const messageName = msg.data.message;
                if (sessionBuffer[messageName]) {
                    yield put(sessionBuffer[messageName].actionToCall({ 
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

function* send({ message, payload,
    actionToCall = null, actionPayload = {}}) 
{
    const sessionBuffer = yield getContext('sessionBuffer');
    if (!sessionBuffer)
        throw new Error('You should call "send" from task, forked from socketTask');

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

function* connectionEstablishedTask(messageChannel) {
    log('connectionEstablishedTask started',messageChannel);
    try {
        while(true) {
            yield delay(3000);
        }
    } finally {
        if (yield cancelled())
            log('canceled connectionEstablishedTask');
    }
}

function* socketTask(connEstablishedTaskFn = null) {
    let socket, recvChannel, sendChannel, sessionBuffer;
    try {
        while (true) {
            sessionBuffer = {};            
            socket = new WebSocket(config.WebsocketClient.url, 'echo-protocol');
            recvChannel = yield call(watchMessages, socket);
            sendChannel = yield actionChannel(SOCKET_SEND);
            
            yield setContext({ sessionBuffer });

            yield race([
                call(recvListener, { socket, recvChannel, sendChannel, sessionBuffer, connEstablishedTaskFn }), 
                call(sendListener, { socket, recvChannel, sendChannel, sessionBuffer })
            ]);

            recvChannel.close();
            sendChannel.close();
            socket.close(3999);

            // reconnect timeout
            yield delay(config.WebsocketClient.reconnectTimeout);
        }
    } finally {
        if (yield cancelled()) {
            socket.close(4000);
            recvChannel.close();
            sendChannel.close();
            // messageChannel.close();
            log('cancelled socketTask');
        }
    }
}

export default function* wsSaga() {
    yield setContext({ sessionName: uuid() });

    while (true) {
        yield take(APPLICATION_EN);
        try {
            const task = yield fork(socketTask, connectionEstablishedTask);
            
            yield take(APPLICATION_DIS);

            task.cancel();
        } catch (e) {
            yield put(APPLICATION_DIS);
            error(e);
        }
    }
};

