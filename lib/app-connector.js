var socketio = require('socket.io'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

function AppConnector(port, handleEvents) {
  this.io = socketio(port);
  this.currentValues = {
    grab: null
  };
  this.handleEvents = handleEvents || ['switch'];
  this.io.on('connection', this.onConnection.bind(this));
}
util.inherits(AppConnector, EventEmitter);

AppConnector.prototype.setGrabValue = function setGrabValue (value) {
  if (this.currentValues.grab != value) {
    this.currentValues.grab = value;
    this.io.emit('grab', value);
  }
};

AppConnector.prototype.sendCurrentValues = function sendCurrentValues(socket) {
  var self = this;
  Object.keys(this.currentValues).forEach(function (name) {
    socket.emit(name, self.currentValues[name]);
  });
};

AppConnector.prototype.onConnection = function onConnection (socket) {
  var self = this;
  this.handleEvents.forEach(function (event) {
    socket.on(event, self.onSocketEvent.bind(self, socket, event));
  });
  socket.on('disconnect', this.onSocketEvent.bind(this, socket, 'disconnect'));
  this.emit('connection', socket);
  this.sendCurrentValues(socket);
};

AppConnector.prototype.onSocketEvent = function onSocketEvent (socket, event, data) {
  this.emit(event, socket, data);
};

module.exports = AppConnector;