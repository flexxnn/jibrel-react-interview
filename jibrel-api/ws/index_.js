
/* global __dirname, DB, module */

var	_				= require('lodash'),
	log 			= require('debug')('messaging:log'),
	error 			= require('debug')('messaging:error');

var Messaging = function(sockServer)
{
	var self = this;
	this.sockets = {};

	this.modules = {};

	sockServer.on('connection', function(conn) {
		var connid = conn.id;
		log ('new connection: '+conn.id);

		self.sockets[connid] = {
			id: connid,
			conn: conn,
			isAuth: false,
            onClose: null,
			send: function(event, data) {
				// if client is not provided callback
				if (!event)
					return;
				var pack = {event: event, data: data};
                // if (event !== 'keepalive')
                //     log("SEND", pack);
				conn.write(JSON.stringify(pack));
			}
		};

		var sock = self.sockets[connid];

		conn.on('data', function(data) {
			var msg;
			try {
				msg = JSON.parse(data);
			} catch (e) {
				error('Cant parse socket data: '+data);
				return;
			}
			if (!msg.event || !msg.data)
			{
				error('Invalid message format: '+data);
				return;
			}
			self.onMessage(sock, msg);
		});

		conn.on('close', function(){
            log ("Close socket "+connid);

            self.sockets[connid].onClose && self.sockets[connid].onClose();
            self.sockets[connid].onClose = null;

			self.sockets[connid] = null;
			delete self.sockets[connid];
		});

        self.sockets[connid].lastKeepAlive = +Date.now();
	});

    var keepAliveFn = function()
    {
        var connid;
        for (connid in self.sockets)
        {
        	var sock = self.sockets[connid];
            
            if(!sock.user) {
            	error("User is not authorized yet");
            	continue;
            }

            sock.send('keepalive', {});

            if (+Date.now() - sock.lastKeepAlive > 10000)
            {
                log("disconnecting "+(sock.user.is_mserver ? "mserver" : "user")+" " + connid + ", because no answer to keep-alive packets");

                sock.onClose && sock.onClose();
                sock.onClose = null;

                sock.conn.close();
            }
        }
    };
    setInterval(keepAliveFn, 5000);

	this.loadModule('echo');
	this.loadModule('auth');
	this.loadModule('mserver');
	this.loadModule('board');
	this.loadModule('location');
	this.loadModule('experiment');
	this.loadModule('support');

	log('messaging started');
};

Messaging.prototype.loadModule = function(module)
{
	var path = __dirname + '/' + module,
		self = this;

	self.modules[module] = require_watch(path, function(mod) { self.modules[module] = mod; });

	if (self.modules[module])
		log("loaded module '"+module+"'");
	else
		error("cant load module '"+module+"'");
};

/**
 * Send message to user or event with users
 * to = {system_id, user_id}
 * to = null - send to all auth users
 */
Messaging.prototype.sendTo = function(to, event, data)
{
	var num = 0,
		self = this;

	//if(event !== "keepalive") {
	//	log("Messaging sendTo. to: ", to, " event: ", event, " data: ", JSON.stringify(data, null, 4));
	//}

	if (!to)
	{
		for (var i in self.sockets)
			if (self.sockets.isAuth)
			{
				self.sockets[i].send(event, data);
				num++;
			}
		return num;
	}

	// try to log sended messages for experiment
	// except private messages to users
	if (to.user_type !== 'user' && to.system_id && !to.user_id &&
	DB.systems[to.system_id] &&
	DB.systems[to.system_id].exp &&
	DB.systems[to.system_id].exp.isStarted())
	{
		//require("debug")("messaging:qwe")("Messaging sendTo. to: ", to, " event: ", event, " data: ", JSON.stringify(data, null, 4));
		DB.systems[to.system_id].exp.logEvent({eventName: event, data: data});
	}

	for (var i in self.sockets)
	{
		var sock = self.sockets[i];
		if (!sock.isAuth || !sock.user)
			continue;
		if (to.user_id)
		{
			if (to.user_id == sock.user.id)
				if (!to.system_id)
				{
					sock.send(event, data);
					num++;
				}
				else
					if (to.system_id == sock.user.system_id)
					{
						sock.send(event, data);
						num++;
					}
		}
		else
			if (to.system_id && to.system_id == sock.user.system_id)
			{
                // send only to users, not to mservers
                if (to.user_type === 'user' && sock.user.is_mserver == 1)
                    continue;
                // send to mservers only
                if (to.user_type === 'mserver' && sock.user.is_mserver == 0)
                    continue;
                // send to all in this system
				sock.send(event, data);
				num++;
			}
	}
};

Messaging.prototype.onMessage = function(sock, msg)
{
	var self = this;
	if (msg.event.indexOf('.') === -1)
	{
		error('invalid message format: '+msg.msg);
		sock.send(msg.cb, {success: 0, error: 'INVALID_MSG_FORMAT'});
		return;
	}

	var moduleName = msg.event.split('.')[0],
		methodName = msg.event.split('.')[1],
		module = self.modules[moduleName];

	if(sock.user && sock.user.is_mserver) {
		if (sock.user.system_id &&
			DB.systems[sock.user.system_id] &&
			DB.systems[sock.user.system_id].exp &&
			DB.systems[sock.user.system_id].exp.isStarted()) {

			//require("debug")("messaging:qwe")('received new from mserver. during experiment message: ',JSON.stringify(msg, null, 4));
			DB.systems[sock.user.system_id].exp.logEvent({eventName: methodName, data: msg.data});
		}
	}

    //if (msg.event !== 'echo.keepalive') {
    //    log('received new message: ',JSON.stringify(msg, null, 4));
    //}

	msg.method = methodName;

	if (! (module && module['_checkAccess']) )
	{
		error('invalid module: '+module);
		sock.send(msg.cb, {success: 0, error: 'INVALID_MODULE'});
		return;
	}

	if (methodName == '_checkAccess' || !module[methodName])
	{
		sock.send(msg.cb, {success: 0, error: 'INVALID_METHOD'});
		return;
	}

	// 1st call _checkAccess
	var checkAccess = module['_checkAccess'];
	if (! (checkAccess)(sock, msg) )
	{
		sock.send(msg.cb, {success: 0, error: 'ACCESS_DENIED'});
		return;
	}

	// call method from module
	var method = module[methodName];
	(method)(sock, msg);
};

module.exports = Messaging;

