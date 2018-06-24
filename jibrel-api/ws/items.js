
/* global module */

const _             = require('lodash'),
    log             = require('debug')('items:log'),
    error           = require('debug')('items:error');

const ItemQueue = require('../lib/ItemQueue');
const WorkerPool = require('../lib/WorkerPool');

class Items {
    constructor() {
        // create queue
        this._wsQueue = new ItemQueue();
        // create worker pool
        this._workerPool = new WorkerPool(this._wsQueue);
        this._workerPool.run();

        this._clientSessions = {};
    };

    checkAccess( /*sock, msg */ ) {
        return true;
    }

    connClose(/* sock */) {
        return true;
    }

    addItem(sock, msg) {
        const itemData = msg.payload;
        if (!itemData || !itemData.payload || !itemData.sessionId) {
            return sock.send(msg.cb, { success: false, error: 'INVALID_MESSAGE_FORMAT' })
        }
        // save relation: socket_id -> client session id
        this._clientSessions[itemData.sessionId] = sock._id;
        
        restQueue.createItem(itemData).then(
            (createdItem) => {
                //res.status(400).json({ message: "Item creation failture", code: "SERVER_ERROR" });
                res.json(createdItem);
            },
            ()=> {
                res.status(400).json({ message: "Item creation failture", code: "SERVER_ERROR" });
            }
        );
    }

    get modName() {
        return 'items';
    }

    get disabled() {
        return false;
    }
};

module.exports = new Items();
