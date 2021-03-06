const log           = require('debug')('Worker:log');
const error         = require('debug')('Worker:error');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Worker {
    constructor(itemQueue, processFn) {
        this._itemQueue = itemQueue;
        this._stop = false;
        this._stopPromise = null;
        this._processItem = processFn;

        this.run = this.run.bind(this);
        this.stop = this.stop.bind(this);
    }

    async run() {
        this._stopPromise = Promise;
    
        log(`Worker started (Queue: ${this._itemQueue.name})`);
        this._stop = false;

        // get next message from itemQueue
        while(!this._stop) {
            let item;
            try {
                item = await this._itemQueue.popItem();
            } catch (e) {
                // queue is empty, or can't get next item
                await timeout(100);
                continue;
            }

            try {
                // set working status
                await this._itemQueue.updateItem(item.id, {}, 'working');
                // process
                log("_processItem (Queue: "+this._itemQueue.name+")", item.id);
                const result = await this._processItem(item);
                // put it back
                await this._itemQueue.updateItem(item.id, result);
            } catch (e) {
                try {
                    await this._itemQueue.updateItem(item.id, { error: 'PROCESS_ERROR' }, 'error');
                } catch (e) {}

                error('Worker error', e);
                await timeout(100);
            }
        }
        
        log(`Worker stopped (Queue: ${this._itemQueue.name})`);
        this._stopPromise.resolve();
    }

    stop() {
        this._stop = true;
        return this._stopPromise;
    }
};

module.exports = Worker;