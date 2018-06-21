
const Worker = require('./Worker');

class WorkerPool {
    constructor(itemQueue, numWorkers = 2) {
        this._workers = [];
        for (let i = 0; i < numWorkers; i++)
            this._workers.push(new Worker(itemQueue));
    }

    run() {
        this._workers.map(async (worker) => await worker.run());
        // const runProm = this._workers.map((worker) => worker.run);
        // console.log(runProm);
        // Promise.all(runProm);
    }

    stop() {
        // request stop for all
        const stopProm = this._workers.map((worker) => worker.stop());
        // wait them all
        Promise.all(stopProm);
    }
}

module.exports = WorkerPool;