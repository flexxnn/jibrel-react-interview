const fs            = require('fs');
const path          = require('path');
const uuid          = require('node-uuid');
const basename      = path.basename(module.filename);
const WebSocketServer = require('websocket').server;

const log           = require('debug')('ws:log');
const error         = require('debug')('ws:error');

class Messaging {
    constructor(httpServer, context = {}) {
        this._modules = {};
        this._clients = {};
        this._context = context;

        this._loadModules();

        this._sockServer = new WebSocketServer({
            httpServer,
            autoAcceptConnections: false
        });

        this._sockServer.on('request', this._onWSRequest = this._onWSRequest.bind(this));

        log("Messaging started");
    }

    _originIsAllowed(/* orign */) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    _onWSRequest(request) {
        if (!this._originIsAllowed(request.orign)) {
            request.reject();
            error('Request rejected, orign in not allowed');
            return;
        }

        const sock = request.accept('echo-protocol', request.origin);
        sock._id = uuid.v4();
        this._clients[sock._id] = {
            conn: sock
        };

        sock.send = (message, payload) => {
            sock.sendUTF(JSON.stringify({ message, payload }));
        };

        sock.on('message', (message) => {
            if (message.type === 'utf8') {
                let msg;
                try {
                    msg = JSON.parse(message.utf8Data);
                } catch (e) {
                    error('Invalid JSON: ', message.utf8Data);
                    return;
                }

                if (!msg.message || !msg.payload) {
                    error('Invalid message format: ' + JSON.stringify(msg, false, 2));
                    return;
                }

                this._onMessage(sock, msg);
            }
        });

        sock.on('close', (reasonCode, description) => {
            // notify all modules, that connection is closed
            Object.keys(this._modules).map(m => m.connClose && m.connClose(sock));
            
            delete this._clients[sock._id];
            log('Connection closed', reasonCode, description);
        });

        log('Connection accepted');        
    }

    _loadModules()
    {
        fs.readdirSync(__dirname)
            .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
            .forEach((file) => {   
                const mod = require(path.join(__dirname, file));
                if (!mod.disabled && mod.modName) {
                    this._modules[mod.modName] = mod;
                    mod.messaging = this;
                    log(`Loaded module ${mod.modName} ${file}`);
                }
            });
    };

    _onMessage(sock, msg) {
        // log(JSON.stringify(msg, false, 2));

        if (!msg.cb)
            msg.cb = `${msg.message}:RESPONSE`;

        // check for message format
        if (msg.message.indexOf('.') === -1) {
            error('invalid message format: '+message);
            sock.send(cb, {success: false, code: 'INVALID_MSG_FORMAT'});
            return;
        }

        // find module
        const moduleName = msg.message.split('.')[0],
		      methodName = msg.message.split('.')[1],
		      module = this._modules[moduleName];

        if (!module) {
            sock.send(cb, {success: false, code: 'INVALID_MODULE'});
            return;
        }

        // we can't call _checkAccess directly from UI
        if (methodName.substr(0, 1) === '_' ||
            methodName === 'modName' ||
            methodName === 'disabled' ||
            methodName === 'messaging' || 
            !module[methodName]) {
            sock.send(cb, {success: false, code: 'INVALID_METHOD'});
            return;
        }

        // 1st call _checkAccess
        const checkAccess = module['_checkAccess'];
        if (checkAccess) {
            if (! (checkAccess)(sock, msg) )
            {
                sock.send(cb, {success: false, code: 'ACCESS_DENIED'});
                return;
            }
        }
    
        // call method from module
        const method = module[methodName];
        method.call(module, sock, msg, this);
    }

    static getServer(httpServer) {
        return new WebSocketServer({
            httpServer,
            autoAcceptConnections: false
        });
    }

    get context() {
        return this._context;
    }

    get clients() {
        return this._clients;
    }

    /**
     * Sends message to connected clients
     * 
     * @param {String,Array} to - connectionId or array with connectionIds
     * @param {String} message 
     * @param {Object} payload 
     */
    sendTo(to, message, payload) {
        if (typeof to === 'string' && this._clients[to] && this._clients[to].conn) {
            this._clients[to].conn.send(message, payload);
            return;
        }
        if (Array.isArray(to)) {
            to.map(id => {
                if (this._clients[id] && this._clients[id].conn)
                    this._clients[id].conn.send(message, payload);
            });
            return;
        }
    }

    /**
     * Sends message to all connected clients
     * 
     * @param {String} message 
     * @param {Object} payload 
     */
    broadcast(message, payload) {
        this.sendTo(Object.keys(this._clients), message, payload);
    }
}

module.exports = Messaging;
