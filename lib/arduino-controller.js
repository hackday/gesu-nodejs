var SerialPort = require('serialport').SerialPort,
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    Q = require('q');


function ArduinoController(port, options) {
  this.port = new SerialPort(port, options, false);
  this.lastPower = 0;
  this.queue = [];
  this.writeActive = false;
  this.port.on('open', this.onOpen.bind(this));
  this.port.on('disconnect', this.onDisconnect.bind(this));
  this.open();
}
util.inherits(ArduinoController, EventEmitter);

ArduinoController.prototype.open = function open() {
  var d = Q.defer();
  this.port.open(d.makeNodeResolver());
  d.promise.catch(this.onDisconnect.bind(this)).done();
  return d.promise;
};

ArduinoController.prototype.onOpen = function onOpen() {
  this.port.on('data', this.onData.bind(this));
  this.writeQueue();
  this.emit('open');
};

ArduinoController.prototype.onDisconnect = function onDisconnect() {
  setTimeout(this.open.bind(this), 2000);
  this.emit('disconnect');
};

ArduinoController.prototype.setPower = function setPower(power) {
  if (this.lastPower != power) {
    this.lastPower = power;
    this.write(power + '\n')
  }
};

ArduinoController.prototype.onData = function onData(data) {
  // stub
  this.emit('data', data);
};

ArduinoController.prototype.write = function write(data) {
  // stub
  var defer = Q.defer();
  this.queue.push([data, defer]);
  if (this.port.isOpen()) {
    this.writeQueue();
  }
  return defer.promise;
};

ArduinoController.prototype.writeQueue = function writeQueue() {
  if (this.writeActive || this.queue.length == 0)
    return;
  var self = this;
  var port = this.port;
  this.writeActive = true;
  var first = this.queue.pop();
  var defer = Q.fcall(function () {
    var d = Q.defer();
    port.write(first[0], d.makeNodeResolver());
    return d.promise;
  }).then(function () {
    // write returns numBytes, but we ignore it.
    var d = Q.defer();
    port.drain(d.makeNodeResolver());
    return d.promise;
  }).then(
    function (result) {
      first[1].resolve(result);
    },
    function (error) {
      first[1].reject(error);
    }
  ).fin(function () {
    self.writeActive = false;
    process.nextTick(self.writeQueue.bind(self));
  });
  return defer.promise;
};

module.exports = ArduinoController;
