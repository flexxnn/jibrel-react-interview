
/* global module */

// const log = require('debug')('ws-items:log');
const error = require('debug')('ws-items:error');

const ItemQueue = require('../lib/ItemQueue');
const WorkerPool = require('../lib/WorkerPool');
const ItemHelperWS = require('../lib/ItemHelper').ItemHelperWS;

const conf = require('../config');
const numWorkers = conf.ws.numWorkers || 1;

class Items {
    constructor() {
        // create queue
        this._wsQueue = new ItemQueue('ws');
        // create worker pool
        this._workerPool = new WorkerPool(this._wsQueue, numWorkers);
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
        this._messaging.sendTo(sockId, 'ITEM_UPDATED', ItemHelperWS(item));
    }

    _getSessionId(sock) {
        const socketId = sock._id;
        return Object.keys(this._clientSessions).find(key => this._clientSessions[key] === socketId);
    }

    updateSessionId(sock, msg) {
        if (msg.payload && msg.payload.sessionId) {
            this._clientSessions[msg.payload.sessionId] = sock._id;
        }
    }

    addItem(sock, msg) {
        if (!msg.payload || !msg.payload.requestPayload) {
            error('addItem:INVALID_MESSAGE_FORMAT: ', JSON.stringify(msg.payload, false, 2));
            return sock.send(msg.cb, { success: false, code: 'INVALID_MESSAGE_FORMAT' });
        }

        const sessionId = this._getSessionId(sock);
        if (!sessionId)
            return sock.close();
        
        this._wsQueue.createItem(msg.payload.requestPayload, sessionId).then(
            (createdItem) => {
                sock.send(msg.cb, { success: true, payload: ItemHelperWS(createdItem) });
            }, () => {
                error('addItem:CANT_CREATE_ITEM: ', JSON.stringify(msg.payload, false, 2));
                sock.send(msg.cb, { success: false, code: 'CANT_CREATE_ITEM', message: 'Item creation failture' });
            }
        );
    }

    getItem(sock, msg) {
        if (!msg.payload || !msg.payload.id) {
            error('getItem:INVALID_MESSAGE_FORMAT:', JSON.stringify(msg.payload, false, 2));
            return sock.send(msg.cb, { success: false, code: 'INVALID_MESSAGE_FORMAT' });
        }

        this._wsQueue.getItem(msg.payload.id).then(
            (item) => {
                sock.send(msg.cb, { success: true, payload: ItemHelperWS(item) });
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
