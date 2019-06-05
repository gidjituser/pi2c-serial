const net = require('net');
const debug = require('debug')('tcp');
const port = process.env.TCP_PORT || 47070;
const host = '0.0.0.0';


module.exports = class TCPServer {
  constructor() {
		this.sockets = [];
  }
  setup(serialport) {
		this.server = net.createServer();
		this.server.on('connection', (sock) => {
			debug('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
			this.sockets.push(sock);
			sock.on('data', (data) => {
				debug(`TCPDATA ${sock.remoteAddress}: port ${sock.remotePort}: data ${data}`);
				try { 
					serialport.write(data);
				} catch(error) {
					console.log(`write serialport error ${error}`);
				}
			});
      sock.on("error", (err) => {
        console.log("Caught server socket error: ")
        console.log(err.stack)
				let index = this.sockets.findIndex((o) => {
					return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
				})
				if (index !== -1) this.sockets.splice(index, 1);
      })
			// Add a 'close' event handler to this instance of socket
			sock.on('close', (data) => {
				let index = this.sockets.findIndex((o) => {
					return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
				})
				if (index !== -1) this.sockets.splice(index, 1);
				debug('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
			});
		});
		serialport.on('data', this.serialDataListener.bind(this));
		this.server.listen(port, host, () => {
			console.log('TCP Server is running on port ' + port + '.');
		});
  }
	serialDataListener(data) {
		for(let k of this.sockets.keys()) {
			try {
				this.sockets[k].write(data, () => {

				});
			} catch(error) {
				console.log(`write socker error ${error}`);
			}
		}
	}
  close(serialport) {
		for(let k of this.sockets.keys()) {
			this.sockets[k].close();
		}
		if(this.server) {
			this.server.removeAllListeners();
			this.server.close();
			this.server = null;
		}
		serialport.removeListener('data', this.serialDataListener);
  }
}
