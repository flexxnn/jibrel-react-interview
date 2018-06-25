
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function tick() {
    return new Promise(resolve => setTimeout(resolve, 1));
}

class Worker {
    constructor(itemQueue) {
        this._itemQueue = itemQueue;
        this._stop = false;
        this._stopPromise = null;

        this.run = this.run.bind(this);
        this.stop = this.stop.bind(this);
    }

    async _processItem(item) {
        console.log("_processItem ("+this._itemQueue.name+")", item.id);
        const ms = Math.floor(Math.random()*10000) + 1;
        await timeout(ms);
        return {
            ...item,
            result: { processingTime: ms }
        }
    }

    async run() {
        console.log('Worker run');
        this._stop = false;
        // this._stopPromise = new Promise();

        // get next message from itemQueue
        while(!this._stop) {
            let item;
            try {
                item = await this._itemQueue.popItem();
            } catch (e) {
                // queue is empty, or can't get next item
                await tick();
                continue;
            }

            try {
                const result = await this._processItem(item);
                await this._itemQueue.updateItem(item.id, result);
            } catch (e) {
                console.error('Worker error', e);
            }
            await tick();
        }
        // this._stopPromise.resolve();
    }

    stop() {
        this._stop = true;
        return this._stopPromise;
    }
};

module.exports = Worker;