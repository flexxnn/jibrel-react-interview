
/* global module */

var _               = require('lodash'),
    log             = require('debug')('echo:log'),
    error           = require('debug')('echo:error');

var mod = {
    modName: 'echo',
    disabled: false,

    // _checkAccess will be before, must return true or false
    checkAccess: function(sock, msg) {
        return true;
    },

    ping: function(sock, msg) {
        var data = _.defaults(msg.payload, {message: 'message was not set'});
        sock.send(msg.cb, {success: true, message: data.message});
    }
};

module.exports = mod;

