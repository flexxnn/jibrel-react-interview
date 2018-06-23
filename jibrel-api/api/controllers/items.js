'use strict';

const ItemQueue = require('../../lib/ItemQueue');
const WorkerPool = require('../../lib/WorkerPool');

// create queue
const restQueue = new ItemQueue();
const workerPool = new WorkerPool(restQueue);
workerPool.run();

function postItem(req, res) {
    // console.log(req.swagger);
    const requestPayload = req.swagger.params.body.value.requestPayload;

    restQueue.createItem(requestPayload).then(
        (createdItem) => {
            //res.status(400).json({ message: "Item creation failture", code: "SERVER_ERROR" });
            res.json(createdItem);
        },
        ()=> {
            res.status(400).json({ message: "Item creation failture", code: "SERVER_ERROR" });
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
            res.status(400).json({ message: error, code: "SERVER_ERROR" });
        }
    );
}

function getItems(req, res) {
    res.status(400).json({ message: 'not implemented', code: "NOT_IMPLEMENTED" });
}

module.exports = {
    postItem,
    getItem,
    getItems
};
