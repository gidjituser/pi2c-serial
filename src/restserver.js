const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const packageVersion = require('../package.json').version;

//Rs232/Serial parsing
const isError = function(e) {
 return e && e instanceof Error;
}

function validStringInteger(num) {
  if(typeof num === 'string') {
    const pNum = parseInt(num);
    if(pNum !== NaN) {
      return pNum;
    }
  }
  return Error(`Argument is not valid String Integer`);
}
function parseSerialSetBaudrate(input) {
  let val = validStringInteger(input); 
  if(isError(val)) {
    return val;
  }
  switch (val) {
    case 110:
    case 300:
    case 1200:
    case 2400:
    case 4800:
    case 9600:
    case 14400:
    case 19200:
    case 38400:
    case 57600:
    case 115200:
    break;
    default:
      return Error(`Value ${val} not a valid option - [110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200]`);
    break;
  }
  return val;
}

module.exports = class RestServer {
  constructor() {
    this.server = null;
  }
  setup(serialport) {
    //setup rest api for baudrate 
    this.app = new Koa();
    this.router = new Router();

    this.router.post('/api/v1/setBaudRate/:baudRate', async (ctx, next) => {
      return new Promise((resolve, reject) => {
        const val = parseSerialSetBaudrate(ctx.params.baudRate);
        if(isError(val)) {
          ctx.status = 400;
          ctx.body = {
            success: false,
            error: val.message
          }
          resolve();
          return;
        }
        serialport.update({baudRate: val}, (err) => {
          if(isError(err)) {
            ctx.status = 400;
            ctx.body = {
              success: false,
              error: err.message
            }
          } else {
            ctx.body = {
              success: true,
              baudRate: serialport.baudRate
            }
          }
          resolve();
        });
      });// end promise
    });
    this.router.get('/api/v1/baudRate', async (ctx, next) => {
      ctx.body = {
        success: true,
        baudRate: serialport.baudRate
      }
    });
    this.router.get('/api/v1/version', async (ctx, next) => {
      ctx.body = {
        version: packageVersion
      }
    });

    this.app
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(cors())
    // create the server
    const REST_PORT = process.env.REST_PORT || 82;
    this.server = this.app.listen(REST_PORT, () => {
      console.log(`Rest Server listening on port: ${REST_PORT}`);
    });
  }
}
