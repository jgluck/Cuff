var http = require('http'); 
var sio = require('socket.io');
var fs = require('fs');
var com = require("serialport");



var logStream = fs.createWriteStream('backend.log',{ flags: 'a'});


var log = function(message){
    logStream.write(message);
}

log('**** STARTING SERVER ****');

var server = http.createServer(function(req, res){ 
    res.writeHead(200, {'Content-Type': 'text/html'}); 
 
 res.end('hi'); 
});



server.listen(8124);

io = sio.listen(server);

var bp = 0;

var dx = 0;
var dy = 0;
var xz = 0;



var portName = "/dev/tty.usbmodem1411"

var serialPort = new com.SerialPort(portName, {
    baudrate: 9600,
    parser: com.parsers.readline('\r\n')
  });

serialPort.on('open',function() {
  log('Serial port open');
  console.log('Port open');
});



serialPort.on('data', function(data) {
  splitdat = data.split(/\t+/);
  if(splitdat[1]==="pulse"){

    io.sockets.in('clients').emit('pulse',{pulse: splitdat[2]});
  }else if(splitdat[1] === "dx"){
    io.sockets.in('clients').emit('dx',{pin: splitdat[0], dx: splitdat[2]});
  }else if(splitdat[1] === "dy"){
    io.sockets.in('clients').emit('dy',{pin: splitdat[0], dy: splitdat[2]});
  }else if(splitdat[1] === "dz"){
    io.sockets.in('clients').emit('dz',{pin: splitdat[0], dz: splitdat[2]});
  }
});




io.sockets.on('connection', function (socket) {
  log('Client joined: ' + socket);
  socket.join('clients');
});




serialPort.on('close',function(){
    console.log("Closed Port");
  })


