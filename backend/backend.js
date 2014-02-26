var http = require('http'); 
var sio = require('socket.io');
var fs = require('fs');
var com = require("serialport");



var logStream = fs.createWriteStream('backend.log',{ flags: 'a'});


var log = function(message){
    logStream.write(message + "\n");
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



// var portName = "/dev/tty.usbmodem1411"
var portName = "/dev/tty.usbmodemfa131"


var serialPort = new com.SerialPort(portName, {
    baudrate: 9600,
    parser: com.parsers.readline('\r\n')
  });

serialPort.on('open',function() {
  log('Serial port open');
  console.log('Port open');
});



serialPort.on('data', function(data) {

  console.log(data);
  
  if(data){
    splitdat = data.split(/\t+/);
    if(splitdat.length == 3){
      value = splitdat[2].split(': ')[0]
      if(splitdat[1]==="pulse"){
        io.sockets.in('clients').emit('pulse',{pulse: splitdat[2]});
      }else if(splitdat[1] === "dx"){
        io.sockets.in('clients').emit('dx',{pin: splitdat[0], dx: value});
      }else if(splitdat[1] === "dy"){
        io.sockets.in('clients').emit('dy',{pin: splitdat[0], dy: value});
      }else if(splitdat[1] === "dz"){
        io.sockets.in('clients').emit('dz',{pin: splitdat[0], dz: value});
      }
    }else{
      log("Bad Line: "+data);
    }
  }
});




io.sockets.on('connection', function (socket) {
  log('Client joined: ' + socket);
  socket.join('clients');
});




serialPort.on('close',function(){
    console.log("Closed Port");
  })


