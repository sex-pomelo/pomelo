"use strict";

const util = require('util');
const EventEmitter = require('events').EventEmitter;

const ST_INITED = 0;
const ST_CLOSED = 1;

/**
 * Socket class that wraps socket.io socket to provide unified interface for up level.
 * 
 * @class
 * @constructor
 * @memberof SioConnector
 */
let Socket = function(id, socket) {
  EventEmitter.call(this);
  this.id = id;
  this.socket = socket;
  this.remoteAddress = {
    ip: socket.handshake.address.address,
    port: socket.handshake.address.port
  };

  let self = this;

  socket.on('disconnect', this.emit.bind(this, 'disconnect'));

  socket.on('error', this.emit.bind(this, 'error'));

  socket.on('message', function(msg) {
    self.emit('message', msg);
  });

  this.state = ST_INITED;

  // TODO: any other events?
};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

Socket.prototype.send = function(msg) {
  if(this.state !== ST_INITED) {
    return;
  }
  if(typeof msg !== 'string') {
    msg = JSON.stringify(msg);
  }
  this.socket.send(msg);
};

Socket.prototype.disconnect = function() {
  if(this.state === ST_CLOSED) {
    return;
  }

  this.state = ST_CLOSED;
  this.socket.disconnect();
};

Socket.prototype.sendBatch = function(msgs) {
  this.send(encodeBatch(msgs));
};

/**
 * Encode batch msg to client
 * @access private
 */
let encodeBatch = function(msgs){
  let res = '[', msg;
  for(let i=0, l=msgs.length; i<l; i++) {
    if(i > 0) {
      res += ',';
    }
    msg = msgs[i];
    if(typeof msg === 'string') {
      res += msg;
    } else {
      res += JSON.stringify(msg);
    }
  }
  res += ']';
  return res;
};
