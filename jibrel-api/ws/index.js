
const fs            = require('fs');
const path          = require('path');
const basename      = path.basename(module.filename);
const log           = require('debug')('ws:log');
const error         = require('debug')('ws:error');

class Messaging {
    constructor(sockServer) {
        this._modules = {};
        this._loadModules();
        sockServer.on('request', this._onWSRequest = this._onWSRequest.bind(this));        
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

        const connection = request.accept('echo-protocol', request.origin);
        log('Connection accepted');

        connection.send = (message, payload) => {
            connection.sendUTF(JSON.stringify({ message, payload }));
        };

        connection.on('message', (message) => {
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

                this._onMessage(connection, msg);
            }
        });
        connection.on('close', (reasonCode, description) => {
            log('Connection closed', reasonCode, description);
        });
    }

    _loadModules()
    {
        fs.readdirSync(__dirname)
            .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
            .forEach((file) => {   
                const mod = require(path.join(__dirname, file));
                if (!mod.disabled && mod.modName) {
                    this._modules[mod.modName] = mod;
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
            sock.send(cb, {success: false, error: 'INVALID_MSG_FORMAT'});
            return;
        }

        // find module
        const moduleName = msg.message.split('.')[0],
		      methodName = msg.message.split('.')[1],
		      module = this._modules[moduleName];

        if (!module) {
            sock.send(cb, {success: false, error: 'INVALID_MODULE'});
            return;
        }

        // we can't call _checkAccess directly from UI
        if (methodName == '_checkAccess' || !module[methodName]) {
            sock.send(cb, {success: false, error: 'INVALID_METHOD'});
            return;
        }

        // 1st call _checkAccess
        const checkAccess = module['_checkAccess'];
        if (checkAccess) {
            if (! (checkAccess)(sock, msg) )
            {
                sock.send(cb, {success: false, error: 'ACCESS_DENIED'});
                return;
            }
        }
    
        // call method from module
        const method = module[methodName];
        (method)(sock, msg);
    }

}

module.exports = Messaging;
