'use strict';

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
                status: 'new',
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

    get itemCount() {
        return Object.keys(this._items).length;
    }

    get queueLength() {
        return this._queue.length;
    }
}

const restQueue = new ItemQueue();

function postItem(req, res) {
    const requestPayload = req.swagger.params.body.value.requestPayload;

    restQueue.createItem(requestPayload).then(
        (createdItem) => {
            res.json(createdItem);
        },
        ()=> {
            res.status(400).json({ message: "Item creation failture", "code": "SERVER_ERROR" });
        }
    );
}

function getItem(req, res) {
    const id = req.swagger.params.id.value;

    restQueue.getItem(id).then(
        (item) => {
            res.json(item);
        },
        (error)=> {
            res.status(400).json({ message: error, "code": "SERVER_ERROR" });
        }
    );
}

module.exports = {
    postItem,
    getItem
};
