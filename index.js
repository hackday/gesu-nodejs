var config = require('./config'),
    ArduinoController = require('./lib/arduino-controller'),
    AppConnector = require('./lib/app-connector'),
    LeapMotionHandler = require('./lib/leapmotion-handler'),
    child_process = require('child_process');


child_process.spawn('sh', ['-c', 'echo "configured inet addresses:"; ifconfig | grep "inet "'], {stdio: 'inherit'});

var arduino = new ArduinoController(config.arduino.serialPort, {
  baudrate: config.arduino.baudrate
});

if (process.env.hasOwnProperty('ARDUINO_DEBUG')) {
  arduino.on('data', function (data) {
    console.log('serial data: ' + data);
  });
}

arduino.on('disconnect', function () {
  console.log('disconnect from arduino; reconnect in 2000ms...');
});

arduino.on('open', function () {
  console.log('connected to arduino!');
});

var app = new AppConnector(config.socketIoPort, ['switch']);
var leapMotion = new LeapMotionHandler(config);

function setScale(scale) {
  app.setGrabValue(scale.grabValue);
  arduino.setPower(scale.powerValue);
}

leapMotion.on('scale', function (scale) {
  setScale(scale);
});
leapMotion.on('leave', function () {
  setScale(config.leaveScale);
});

setScale(config.initialScale);


function socketIOSocketName (socket) {
  return "" + socket.handshake.address + " (UA: " +
    socket.handshake.headers['user-agent'] + ")";
}
//app.sendEvent('abc');
app.on('connection', function (socket) {
  console.log('connection', socketIOSocketName(socket));
});

app.on('disconnect', function (socket, data) {
  console.log('disconnect', socketIOSocketName(socket), data);
});


console.log('loop exit - mainloop start');