
// strip fields from object, before send it to server

const _ = require('lodash');

const ItemHelperREST = (item) => {
    return _.omit(item, 'requestPayload', 'sessionId');
}

const ItemHelperWS = (item) => {
    return _.omit(item, 'requestPayload', 'sessionId');
}

const ItemHelperNone = (item) => item;

module.exports = {
    ItemHelperREST,
    ItemHelperWS,
    ItemHelperNone
}