
/* global module */

var _               = require('lodash'),
    log             = require('debug')('echo:log'),
    error           = require('debug')('echo:error');

var mod = {
    // _checkAccess will be before, must return true or false
    _checkAccess: function(sock, msg)
    {
        return true;
    },

    ping: function(sock, msg)
    {
        var data = _.defaults(msg.data, {message: 'message was not set'});
        sock.send(msg.cb, {success: 1, message: data.message});
    },

    keepalive: function(sock, msg)
    {
        sock.lastKeepAlive = +Date.now();
    },

    mtest: function(sock, msg)
    {
        messaging.sendTo({ system_id: sock.user.system_id, user_type: 'mserver' }, msg.data.event, msg.data.eventData);
    }

};

module.exports = mod;

