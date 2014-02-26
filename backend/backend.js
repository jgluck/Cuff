// import libraries
var http = require("http");
var socketio = require("socket.io");
var fs = require("fs");
var serialport = require("serialport");

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
    log(data);

    if (data) {
        var pieces = data.split(/\t+/);

        if (pieces.length === 3) {
            var pin = pieces[0];
            var type = pieces[1];
            var value = pieces[2].split(": ")[0];

            if (type === "pulse") {
                websocket.sockets.in("clients").emit("pulse", {
                    pin: pin,
                    pulse: value
                });
            } else if (type === "dx") {
                websocket.sockets.in("clients").emit("dx", {
                    pin: pin,
                    dx: value
                });
            } else if (type === "dy") {
                websocket.sockets.in("clients").emit("dy", {
                    pin: pin,
                    dy: value
                });
            } else if (type === "dz") {
                websocket.sockets.in("clients").emit("dz", {
                    pin: pin,
                    dz: value
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
