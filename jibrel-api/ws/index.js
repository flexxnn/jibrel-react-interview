
class Messaging {
    constructor(sockServer) {
        sockServer.on('request', this._onWSRequest = this._onWSRequest.bind(this));
        console.log("Messaging started");
    }

    _originIsAllowed(orign) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    _onWSRequest(request) {
        if (!this._originIsAllowed(request.orign)) {
            request.reject();
            console.log('Request rejected, orign in not allowed');
            return;
        }

        const connection = request.accept('echo-protocol', request.origin);
        console.log('Connection accepted', connection);
        connection.on('message', (message) => {
            if (message.type === 'utf8') {
                let msg;
                try {
                    msg = JSON.parse(message.utf8Data);
                } catch (e) {
                    console.log('Invalid JSON: ', message.utf8Data);
                    return;
                }

                if (!msg.event || !msg.data) {
                    console.log('Invalid message format: ' + JSON.stringify(msg, false, 2));
                    return;
                }

                this.onMessage(msg);
            }
        });
        connection.on('close', (reasonCode, description) => {
            console.log('Connection closed', reasonCode, description);
        });
    }

    onMessage(msg) {
        console.log(JSON.stringify(msg, flase, 2));
    }

}

module.exports = Messaging;
