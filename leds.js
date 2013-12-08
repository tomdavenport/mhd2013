var five = require("johnny-five"),
    midi = require("midi"),

    board, button, leds, input;


var ledMax = 10;

var mentalMode = false;

var motor;


var goMental = function() {
  mentalMode = false;
  motor.start();
}

var noMental = function() {
  mentalMode = false;
  motor.stop();
}

var LedStrip = function(pin) {
  var obj = new five.Led({
    pin: pin,
    type: "PWM"
  });

  return obj;
};


// A midi device "Test Input" is now available for other
// software to send messages to.

// ... receive MIDI messages ...


board = new five.Board();
console.log("board");

var delay = function(duration, cb, args) {
  setTimeout(cb,duration, args);
};


board.on("ready", function() {

  var ping = new five.Ping(3);

  motor = new five.Led(11);


  input = new midi.input();
  input.on('message', function(deltaTime, message) {
    console.log(message);
    if (message[0] === 180 && message[1] === 1 ) {
      setLed(2,message[2]);

      if (mentalMode) {
        try {
          setLed(1,message[2]);
          setLed(0,message[2]);
          setLed(3,message[2]);
        } catch (e) {}
      }
    }
    if (message[0] === 132 && message[1] === 48 && message[2] === 64 ) {
      setLed(2,0);
      if (mentalMode) {
        try {
          setLed(1,0);
          setLed(0,0);
          setLed(3,0);
        } catch (e) {}
      }
    }
  });

  input.openVirtualPort("Test Input");

  leds = [
    new LedStrip(5),
    new LedStrip(6),
    new LedStrip(7),
    new LedStrip(8)
  ];

  // // Inject the `servo` hardware into
  // // the Repl instance's context;
  // // allows direct command line access
  // fadeLedIn(0);
  // delay(1000,fadeLedIn,1);
  // delay(2000,fadeLedIn,2);
  // delay(3000,fadeLedIn,3);


  var standardPing = 8000;
  var standardPingMin = 300;
 
  ping.on("data", function(err, value) {
    if (value && standardPing === 0) {
      standardPing = value;
    }
    if (value) 
      ledMax = 255 * (value - standardPingMin) / (standardPing - standardPingMin);

    if (ledMax > 255) ledMax = 255;
    if (ledMax < 0) ledMax = 0;
  });

  board.repl.inject({
    leds:leds,
    fadeLedIn:fadeLedIn,
    ledMax: ledMax,
    fadeLedOut: fadeLedOut,
    motor:motor
  });
});

function setLed(index, value) {
  value = (value / 127) * ledMax;

  leds[index].firmata.analogWrite(leds[index].pin,value);
}


function fadeLedIn(index) {
  triggerLed(index,"fadeIn", 100);
}
function fadeLedOut(index) {
  triggerLed(index,"fadeOut", 500);
}

function triggerLed(index, method, args) {
  leds[index][method](args);
}

function triggerAllLeds(method, args) {
  for (var i in leds) {
    triggerLed(i, method, args);
  }
}





// References
//
// http://servocity.com/html/hs-7980th_servo.html
