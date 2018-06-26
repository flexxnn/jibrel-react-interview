
const log           = require('debug')('WorkerPool:log');
// const error         = require('debug')('WorkerPool:error');

const Worker = require('./Worker');

class WorkerPool {
    constructor(itemQueue, numWorkers = 50) {
        this._itemQueue = itemQueue;
        this._numWorkers = numWorkers;

        this._workers = [];
        this._started = false;

        for (let i = 0; i < numWorkers; i++)
            this._workers.push(new Worker(itemQueue));
        
        this.run = this.run.bind(this);
        this.stop = this.stop.bind(this);

        // setTimeout(() => {
        //     this.stop().then(() => {
        //         log(`OK`);
        //     });
        // }, 10000);

        // process.on('SIGINT', (signal) => {
        //     log('Wait last item, queue: '+itemQueue.name);
        //     this.stop().then(() => {
        //         log('Process terminated, exit');
        //         process.exit();
        //     })
        // });
    }

    run() {
        this._workers.map(async (worker) => await worker.run());
        this._started = true;
    }

    stop() {
        // request stop for all
        const stopProm = this._workers.map((worker) => {
            const stopProm = worker.stop();
            if (stopProm)
                return stopProm;
            else
                return Promise.resolve();
        });

        this._started = false;
        
        // wait them all
        return Promise.all(stopProm).then(() => {
            log(`All workers stopped (Queue: ${this._itemQueue.name})`);
        });
    }
}

module.exports = WorkerPool;