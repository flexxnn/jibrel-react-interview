
/* global module */

// const log = require('debug')('ws-items:log');
const error = require('debug')('ws-items:error');

const ItemQueue = require('../lib/ItemQueue');
const WorkerPool = require('../lib/WorkerPool');

class Items {
    constructor() {
        // create queue
        this._wsQueue = new ItemQueue('ws');
        // create worker pool
        this._workerPool = new WorkerPool(this._wsQueue);
        this._workerPool.run();

        this._clientSessions = {};

        this._messaging = null;

        this._wsQueue.on('ItemUpdated', this._onItemUpdated = this._onItemUpdated.bind(this));
    }

    _checkAccess( /*sock, msg */ ) {
        return true;
    }

    _connClose(/* sock */) {
        return true;
    }

    _onItemUpdated(item) {
        // get the socket_id client session
        const sockId = this._clientSessions[item.sessionId] || '';
        this._messaging.sendTo(sockId, 'ITEM_UPDATED', item);
    }

    addItem(sock, msg) {
        if (!msg.payload || !msg.payload.sessionId || !msg.payload.requestPayload) {
            error('addItem:INVALID_MESSAGE_FORMAT: ', JSON.stringify(msg.payload, false, 2));
            return sock.send(msg.cb, { success: false, code: 'INVALID_MESSAGE_FORMAT' });
        }

        // save relation: socket_id -> client session id
        this._clientSessions[msg.payload.sessionId] = sock._id;

        this._wsQueue.createItem(msg.payload.requestPayload, msg.payload.sessionId).then(
            (createdItem) => {
                sock.send(msg.cb, { success: true, payload: createdItem });
            }, () => {
                error('addItem:CANT_CREATE_ITEM: ', JSON.stringify(msg.payload, false, 2));
                sock.send(msg.cb, { success: false, code: 'CANT_CREATE_ITEM', message: 'Item creation failture' });
            }
        );
    }

    getItem(sock, msg) {
        if (!msg.payload || !msg.payload.sessionId || !msg.payload.id) {
            error('getItem:INVALID_MESSAGE_FORMAT:', JSON.stringify(msg.payload, false, 2));
            return sock.send(msg.cb, { success: false, code: 'INVALID_MESSAGE_FORMAT' });
        }

        // save relation: socket_id -> client session id
        this._clientSessions[msg.payload.sessionId] = sock._id;

        this._wsQueue.getItem(msg.payload.id).then(
            (item) => {
                sock.send(msg.cb, { success: true, payload: item });
            }, () => {
                error('getItem:NOT_FOUND:', JSON.stringify(msg.payload, false, 2));
                sock.send(msg.cb, { success: false, code: 'NOT_FOUND', message: 'Item not found' });
            }
        );
    }

    get modName() {
        return 'items';
    }

    get disabled() {
        return false;
    }

    set messaging(inst) {
        this._messaging = inst;
    }    
};

module.exports = new Items();
