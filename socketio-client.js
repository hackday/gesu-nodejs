var config = require('./config'),
    socketio = require('socket.io-client');

var socket = socketio.connect('http://localhost:' + config.socketIoPort);
socket.on('grab', function (data) {
  process.stdout.write('grab: ' + data + "         \r");
});
