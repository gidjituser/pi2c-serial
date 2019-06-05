# PI2c - Serial
 
- [PI2c - Serial](#pi2c---serial)
  - [Info](#info)
  - [Pin mapping](#pin-mapping)
  - [Setup](#setup)

This is a complimentary repo providing the ability for serial over TCP or Websockets
for the Raspberry PI. Basically makes the PI act as a serial over network adapter.
Note - CTS and RTS are not supported

This repo is complimentary to the PI2c repo allowing you to control the i2c, spi, pwm, and gpio
over a simple rest service.

[PI2c - Rest API](https://github.com/gidjituser/pi2c-rest-api)

## Info

You will need to apply the overlay pi3-disable-bt or pi3-miniuart-bt in order to use the UART
of the PI3 A/B+ and Zero W. The UART by default on most linux distributions is used to
control the BT module. There is plenty of documentation online to do this.

A rest server will be running on default port 82 to configure baudrate. The
default baudrate is 9600. It will need to be set every startup.

- POST /api/v1/setBaudRate/:baudRate
    - Set a new baudRate
    - valid optoins are [110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200]
    - successful [status 200] response application/json {"success": true, "baudRate": number}
    - failed [status 400] response application/json {"success": false, "error": string}.
- GET /api/v1/baudRate
    - Get the current baudrate
    - successful [status 200] response application/json {"success": true, "baudRate": number}
    - failed [status 400] response application/json {"success": false, "error": string}


## Pin mapping

If you are using this directly on your PI you will need to use physical pins 8 and 10 for TX and RX
respectivly.

| Function | PI2c Hat | Pi Header
| ---  | --- | --- |
| UART | | |
| UART_TX | 12 | 8 |
| UART_RX | 14 | 10 |

## Setup

1. Wire your device to the PI2c using the info above
2. Configure the Serial baudrate with via the Rest api

```bash
# Command line example set serial baudrate
curl --request POST http://${REST_SERVER}:82/api/v1/setBaudrate/115200
```

3. Using your desired platform connect to Websocket port 1337 for or TCP port 47070. Traffic over serial will be routed
to these sockets.

```python
# Python TCP write serial example
import socket
class SerialSocket:
  def __init__(self, sock=None):
    if sock is None:
      self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    else:
      self.sock = sock

  def connect(self, host, port):
    self.sock.connect((host, port))

  def write(self, msg):
    totalsent = 0
    MSGLEN = len(msg)
    while totalsent < MSGLEN:
      sent = self.sock.send(msg[totalsent:])
      if sent == 0:
        raise RuntimeError("socket connection broken")
      totalsent = totalsent + sent

  def read(self, num):
    chunks = []
    bytes_recd = 0
    MSGLEN = num
    while bytes_recd < MSGLEN:
      chunk = self.sock.recv(min(MSGLEN - bytes_recd, 2048))
      if chunk == b'':
        raise RuntimeError("socket connection broken")
      chunks.append(chunk)
      bytes_recd = bytes_recd + len(chunk)
    return b''.join(chunks)

serial = SerialSocket()
serial.connect('GO-XXXXXXX', 47070)
serial.write(bytearray("hello\n", "utf-8"))


```