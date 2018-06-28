
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// two algorythm of items processing
async function processItemWS(item) {
    const ms = Math.floor(Math.random()*10000) + 1;
    await timeout(ms);
    return {
        ...item,
        result: { processingTime: ms }
    }
}

async function processItemREST(item) {
    const ms = Math.floor(Math.random()*10000) + 1;
    await timeout(ms);
    return {
        ...item,
        result: { processingTime: ms, someValue: 1000 }
    }
}

module.exports = {
    processItemWS,
    processItemREST
}