var Leap = require('leapjs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

function LeapMotionHandler (config) {
  this.config = {
    grabStrengthScales: config.grabStrengthScales,
    sendInterval: config.sendInterval
  };
  this.nextSendTimestamp = 0;
  this.lastStrengths = [];
  this.startLoop()
}
util.inherits(LeapMotionHandler, EventEmitter);

LeapMotionHandler.prototype.grabStrengthToScales = function grabStrengthToScales(grabStrength) {
  var scaledStrength = 0;
  var scales = this.config.grabStrengthScales;
  for (var i=scales.length-1; i>=0; --i) {
    var scale = scales[i];
    if (grabStrength > scale.grabStrength) {
      return scaledStrength;
    }
    scaledStrength = scale;
  }
  return scaledStrength;
};

LeapMotionHandler.prototype.startLoop = function startLoop() {
  var self = this;
  var controller = self.controller = new Leap.Controller({
    suppressAnimationLoop: true,
    enableGestures: false, // default
    optimizeHMD: false //default
  });
  controller.on('ready', function () {
    console.log('ready');
  });
  controller.on('connect', function () {
    console.log('connect');
  });
  controller.on('frame', this.onFrame.bind(this));
  controller.connect();
};

LeapMotionHandler.prototype.onFrame = function onFrame(frame) {
  var self = this;
  var timestamp = frame.timestamp;
  if (self.nextSendTimestamp < timestamp) {
    self.nextSendTimestamp = timestamp + self.config.sendInterval;
    if (self.lastStrengths.length === 0) {
      self.emit('leave');
      process.stdout.write('leave                               \r');
    } else {
      var sum = 0;
      var lastStrengths = self.lastStrengths;
      lastStrengths.forEach(function (item) {
        sum += item;
      });
      self.lastStrengths = [];
      var avg = sum / lastStrengths.length;
      var scale = self.grabStrengthToScales(avg);
      self.emit('scale', scale);
      process.stdout.write('scale: ' + scale.grabValue + "/" + scale.powerValue +
        ' (str: ' + avg.toFixed(6) + " per " + lastStrengths.length + ')                  \r');
    }
  }
  frame.hands.forEach(function (hand) {
    self.lastStrengths.push(hand.grabStrength);
  });
};

module.exports = LeapMotionHandler;
