const uuid = require('node-uuid');

class ItemQueue {
    constructor() {
        this._items = {};
        this._queue = [];
    }

    createItem(payload) {
        return new Promise( (accept) => {
            const item = {
                id: uuid.v4(),
                status: 'pending',
                requestPayload: payload,
                createdAt: new Date(),
                updatedAt: new Date(0)
            };

            this._items[item.id] = item;
            this._queue.push(item.id);
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

            this._items[id].updatedAt = new Date();
            this._items[id].status = 'working';

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

            accept();
        });
    }

    get itemCount() {
        return Object.keys(this._items).length;
    }

    get queueLength() {
        return this._queue.length;
    }
}

module.exports = ItemQueue;