var WebSocketServer = require('websocket').server;
const http = require('http');
const debug = require('debug')('ws');


module.exports = class WSServer {
  constructor() {
		this.connections = [];
    this.wsServer = null;
    this.httpServer = http.createServer(function(request, response) {
      // process HTTP request. Since we're writing just WebSockets
      // server we don't have to implement anything.
    });
  }
  setup(serialport) {
    // create the server
    this.wsServer = new WebSocketServer({
      httpServer: this.httpServer
    });
    // WebSocket server
    this.wsServer.on('request', (request) => {
      var connection = request.accept(null, request.origin);
			this.connections.push(connection);
      // This is the most important callback for us, we'll handle
      // all messages from users here.
      connection.on('message', (message) => {
				debug(`WSMESSAGE ${message}`);
        if (message.type === 'utf8') {
          serialport.write(message.utf8Data, 'utf8');
        } else if (message.type === 'binary') {
          serialport.write(message.binaryData);
        }
      });
      connection.on('close', (connection) => {
				let index = this.connections.findIndex((o) => {
					return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
				})
				if (index !== -1) this.connections.splice(index, 1);
				debug('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        // close user connection
      });
    });
		serialport.on('data', this.serialDataListener.bind(this));
    this.httpServer.listen(process.env.WS_PORT || 1337, () => {
			console.log(`WS Server is running on port ${process.env.WS_PORT || 1337}`);
    });
  }
	serialDataListener(data) {
		for(let k of this.connections.keys()) {
			this.connections[k].send(data);
    }
	}
  close(serialport) {
		if(this.wsServer) {
      this.wsServer.closeAllConnections();
			this.wsServer.removeAllListeners();
			this.wsServer.shutDown();
			this.wsServer = null;
		}
		serialport.removeListener('data', this.serialDataListener);
  }
}
