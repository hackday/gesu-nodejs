var leaveScale = {
  grabStrength: 0,
  grabValue: 4,
  powerValue: 0
};

module.exports = {
  arduino: {
    serialPort: "/dev/cu.usbmodem1421",
    baudrate: 115200
  },
  socketIoPort: 8081,
  initialScale: leaveScale,
  leaveScale: leaveScale,
  sendInterval: 20000,
  grabStrengthScales: [
    {
      grabStrength: 0,
      grabValue: 0,
      powerValue: 64
    },
    {
      grabStrength: 0.05,
      grabValue: 1,
      powerValue: 80
    },
    {
      grabStrength: 0.1,
      grabValue: 1,
      powerValue: 80
    },
    {
      grabStrength: 0.15,
      grabValue: 1,
      powerValue: 80
    },
    {
      grabStrength: 0.4,
      grabValue: 2,
      powerValue: 98
    },
    {
      grabStrength: 0.5,
      grabValue: 2,
      powerValue: 128
    },
    {
      grabStrength: 0.5,
      grabValue: 2,
      powerValue: 192
    },
    {
      grabStrength: 1,
      grabValue: 3,
      powerValue: 255
    }
  ]};