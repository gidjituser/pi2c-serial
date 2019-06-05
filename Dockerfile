FROM balenalib/raspberrypi3-alpine-node:10 as builder
COPY qemu-arm-static /usr/bin/qemu-arm-static
ENV NPM_CONFIG_UNSAFE_PERM true


#install packages programs and dependencies
RUN apk add --update python libffi-dev openssl-dev gcc libc-dev make g++ 

WORKDIR /usr/src/app

#serial
COPY package.json /usr/src/app
RUN npm install --production
COPY src /usr/src/app/src

FROM balenalib/raspberrypi3-alpine-node:10 

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

LABEL com.centurylinklabs.watchtower.enable="false"
LABEL app="pi2c serial server"
LABEL description="serial server"

ENV APP_VERSION '0.10.7'
ENV REST_PORT 82
LABEL com.concerco.pi2c.serial.APP_VERSION='0.10.7'
#serial tcp/websocket or ENV WS_PORT 1337, ENV TCP_PORT 47070
EXPOSE 47070
EXPOSE 1337
#rest port to configure and get baurdrate
EXPOSE 82

ENV SERIAL_PATH /dev/ttyAMA0
CMD ["/usr/local/bin/node", "src/server.js"]
