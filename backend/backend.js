// import libraries
var http = require("http");
var socketio = require("socket.io");
var fs = require("fs");
var serialport = require("serialport");


var pulseData = [];
var pArrayMaxLen = 250;
var threshold = .75;
var deadZone = .5;
var minPulse = null;
var maxPulse = null;
var inPulse = false; // currently above threshold

var accelDataMaxLen = 10;

var xData = [];
var xDataAverage = null;

var yData = [];
var yDataAverage = null;

var zData = [];
var zDataAverage = null;


var sumArray = function(arr){
    total = 0;
    for(i=0;i<arr.length;i++){
        total+= arr[i];
    }
    return total;
}

var addDXToArray = function(analogValue){
    if(xData.length < accelDataMaxLen){
        xData.push(analogValue);
    }else{
        xData.shift();
        xData.push(analogValue)
    }
    xDataAverage = sumArray(xData)/xData.length;
}

var addDYToArray = function(analogValue){
    if(yData.length < accelDataMaxLen){
        yData.push(analogValue);
    }else{
        yData.shift();
        yData.push(analogValue)
    }
    yDataAverage = sumArray(yData)/yData.length;
}

var addDZToArray = function(analogValue){
    if(zData.length < accelDataMaxLen){
        zData.push(analogValue);
    }else{
        zData.shift();
        zData.push(analogValue)
    }
    zDataAverage = sumArray(zData)/zData.length;
}


var addToPulseArray = function(analogValue){
    if(pulseData.length < pArrayMaxLen){
        pulseData.push(analogValue);
    }else{
        pulseData.shift();
        pulseData.push(analogValue);
    }
    minPulse = Math.min.apply(Math, pulseData);
    maxPulse = Math.max.apply(Math, pulseData);
}

var shouldSendPulse = function(analogValue){
    range = (maxPulse - minPulse) + 1.0
    curVal = (analogValue - minPulse) +1.0
    perThrough = curVal/range;
    if(range < 20){
        return false;
    }
    // log("Range: "+range)
    // log("CurVal: "+curVal);
    // log("perThrough: "+perThrough)
    if(inPulse){
        if(perThrough<deadZone)
            inPulse = false;
        return false;
    }else{
        if(perThrough>threshold){
            inPulse = true;
            return true;
        }
    }
}


// prepare log
var logStream = fs.createWriteStream("backend.log", {flags: "a"});
var log = function(message) {
  logStream.write(message + "\n");
  console.log(message);
}

// prepare server
var serverPort = process.argv[3];
var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
}).listen(serverPort);

log("server port open  : " + serverPort);

// prepare client(s)-server socket
var websocket = socketio.listen(server);
websocket.set("log level", 1);

// prepare arduino-server connection
var arduinoPort = process.argv[2];
var arduino = new serialport.SerialPort(arduinoPort, {
    baudrate: 9600,
    parser: serialport.parsers.readline("\r\n")
});

arduino.on("open", function() {
    log("arduino port open : " + arduinoPort);
});

arduino.on("data", function(data) {
    // log(data);

    if (data) {
        var pieces = data.split(/\t+/);

        if (pieces.length === 3) {
            var pin = pieces[0];
            var type = pieces[1];
            var value = pieces[2].split(": ")[1];

            if (type === "pulse") {
                addToPulseArray(parseInt(value));
                if(shouldSendPulse(value)){
                    websocket.sockets.in("clients").emit("pulse", {
                        pin: pin,
                        pulse: value
                    });
                }

            } else if (type === "dx") {
                addDXToArray(parseInt(value));
                websocket.sockets.in("clients").emit("dx", {
                    pin: pin,
                    dx: (value - xDataAverage)
                });
            } else if (type === "dy") {
                addDYToArray(parseInt(value));
                websocket.sockets.in("clients").emit("dy", {
                    pin: pin,
                    dy: (value - yDataAverage)
                });
            } else if (type === "dz") {
                addDZToArray(parseInt(value));
                websocket.sockets.in("clients").emit("dz", {
                    pin: pin,
                    dz: (value - zDataAverage)
                });
            } else {
                log("bad line : " + data);
            }
        }
    }
});


websocket.sockets.on("connection", function(socket) {
    log("client joined : " + socket);
    socket.join("clients");
});


