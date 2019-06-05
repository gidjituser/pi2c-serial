#!/usr/bin/env node
const TCPServer = require('./tcpserver');
const WSServer = require('./wsserver');
const RestServer = require('./restserver');
const DebugSerial = require('./DebugSerial');
const SerialPort = require('serialport');
const os = require('os');



const tcpServer = new TCPServer();
const wsServer = new WSServer();
const restServer = new RestServer();

let serialport;
if(process.env.DEBUG || os.platform() === 'darwin') {
  serialport = new DebugSerial();
} else {
  serialport = new SerialPort(process.env.SERIAL_PATH || '/dev/AMA0', { autoOpen: false });
}
tcpServer.setup(serialport);
wsServer.setup(serialport);
restServer.setup(serialport);

if(process.env.DEBUG || os.platform() === 'darwin') {
  serialport.begin();
} else {
  serialport.open(() => {
    console.log(`Serial port is open ${serialport.isOpen} at path ${serialport.path}`);
  })
}
