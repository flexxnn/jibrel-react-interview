const uuid = require('node-uuid');
const EventEmitter = require('events');

const log           = require('debug')('ItemQueue:log');
// const error         = require('debug')('ItemQueue:error');

class ItemQueue extends EventEmitter {
    constructor(name = '') {
        super();

        this._items = {};
        this._queue = [];
        this._name = name;

        // our evil function
        this._itemDropInterval = setInterval(() => {
            if (!this._queue.length)
                return;

            const pos = Math.floor(Math.random()*this._queue.length);
            const itemId = this._queue[pos];
            if (!itemId)
                return;

            this._queue.splice(pos, 1);
            delete this._items[itemId];

            log(`Queue (${name}) bug, dropped item ${itemId}`);
        }, 500);
    }

    createItem(payload, sessionId = null) {
        return new Promise( (accept) => {
            const item = {
                id: uuid.v4(),
                status: 'pending',
                requestPayload: payload,
                createdAt: new Date()
            };

            if (sessionId)
                item['sessionId'] = sessionId;

            this._items[item.id] = item;
            this._queue.push(item.id);

            this.emit('ItemAdded', item);
            accept(item);
        });
    }

    getItem(id) {
        return new Promise((accept, reject) => {
            if (!this._items[id])
                return reject(`Item #${id} not found`);
            
            accept(this._items[id]);
        });
    }

    popItem() {
        return new Promise((accept, reject) => {
            const arr = this._queue.splice(0, 1);
            if (!arr.length)
                return reject();

            const id = arr[0];
            if (!this._items[id])
                return reject();

            // this._items[id].updatedAt = new Date();
            // this._items[id].status = 'working';

            accept(this._items[id]);
        });
    }

    updateItem(id, newItem, status = 'success') {
        return new Promise((accept, reject) => {
            if (!this._items[id])
                return reject();
            
            this._items[id] = {
                ...this._items[id],
                ...newItem,
                updatedAt: new Date(),
                status
            };

            this.emit('ItemUpdated', this._items[id]);

            accept();
        });
    }

    get itemCount() {
        return Object.keys(this._items).length;
    }

    get queueLength() {
        return this._queue.length;
    }

    get name() {
        return this._name;
    }
}

module.exports = ItemQueue;