# Cuff
---

Cuff is designed to be a passive input device for video games (and more generally, computer applications)

## Code

The code contained in this repo breaks down into two parts.

### Arduino

This code can simply be loaded onto an Arduino. It communicates the data from CUFF back via Serial. 

##### Arduino Serial Communication Format

    [A0]    pulse   : 420
    [A1]    dx      : 138
    [A2]    dy      : 13
    [A3]    dz      : 95
    
    [A0]    pulse   : 857
    [A1]    dx      : 88
    [A2]    dy      : 94
    [A3]    dz      : 21
    
    .
    .
    .

##### Arduino Wiring - No Resistors Required.

    5 v: Pulse power
    Grnd: pulse grnd
    A0: pulse signal
    
    3.3 v: Wrist power
    Grnd: Wrist ground
    A1: Wrist X Accel
    A2: Wrist Y Accel
    A3: Wrist Z Accel
    
### Backend

Node Js server. With NPM installed you should just be able to run

    cd backend
    npm install
    
Then start the server with

    node backend.js <serial port><web port>
    
for example
    
    node backend.js /dev/tty.usbmodem1411 8124
    
   
