const EventEmitter = require('events');
module.exports = class DebugSerial extends EventEmitter {
  constructor() {
    super();
    this.timeout = null;
    this.baudRate = 9600;
    this.flags = {brk : false, cts : false, dsr : false, dtr : true, rts : true};
  }
  begin() {
    this.timeout = setInterval(this.emitData.bind(this), 5000);
  }
  set(setOptions, cb) {
    this.flags = {...this.flags, ...setOptions};
    cb(null);
  }
  get(cb) {
    const {cts, dsr} = this.flags;
    cb(null, {cts, dsr, dcd: false});
  }
  end() {
    if(this.timeout) {
      clearInterval(this.timeout);
      this.timeout = null;
    }
  }
  update(options, cb) {
    if(options.baudRate) {
      console.log(`Setting baudRate to ${options.baudRate}`);
      this.baudRate = options.baudRate;
      cb(null);
    }
  }
  emitData() {
    this.emit('data', 'hello\n');
  }
  flush(cb) {
    cb(null, {'data': 'ok'})
  }
  write(data) {
    console.log(`serialport: received ${data}`);
  }
}
