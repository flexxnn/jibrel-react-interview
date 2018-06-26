
/* global module */

const log   = require('debug')('ws-echo:log');

const mod = {
    modName: 'echo',
    disabled: false,

    // _checkAccess will be before, must return true or false
    _checkAccess: function(/*sock, msg*/) {
        return true;
    },

    ping: function(sock, msg) {
        log('ping request');
        sock.send(msg.cb, { success: true, message: 'PONG', yourPayload: msg.payload });
    }
};

module.exports = mod;

