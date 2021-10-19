/* 
Lucie Xiao
play 3 analog sensors that output sound and circle graphic
The Arduino file that's running is "threeSensorExample"
*/

//from https://openprocessing.org/sketch/1253474
let l = 400;
let seeed;
let colors = ["#008cff", "#0099ff", "#00a5ff", "#00b2ff", "#00bfff", "#00cbff", "#00d8ff", "#00e5ff", "#00f2ff", "#00ffff", "#ff7b00", "#ff8800", "#ff9500", "#ffa200", "#ffaa00", "#ffb700", "#ffc300", "#ffd000", "#ffdd00", "#ffea00","#F600FF","#F95DFF"];
const N_FRAMES = 500;
//https://openprocessing.org/sketch/1253474

let osc;
let playing = false;
let serial;
let latestData = "waiting for data";  // you'll use this to write incoming data to the canvas
let splitter;
let diameter0 = 0, diameter1 = 0, diameter2 = 0;

let osc1, osc2, osc3, fft;



function setup() {
  
  createCanvas(windowWidth, windowHeight);
  
 //from  https://openprocessing.org/sketch/1253474  
noFill();
strokeCap(SQUARE);
seeed = random(1000);
// from https://openprocessing.org/sketch/1253474
    
    
    
///////////////////////////////////////////////////////////////////
    //Begin serialport library methods, this is using callbacks
///////////////////////////////////////////////////////////////////    
    

  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list();
  console.log("serial.list()   ", serial.list());

  //////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("/dev/tty.usbmodem14301");
 /////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////
  // Here are the callbacks that you can register

  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on('data', gotData);
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on('error', gotError);
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);
  // OR
  //serial.onOpen(gotOpen);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
  // OR
  //serial.onRawData(gotRawData);

 
}
////////////////////////////////////////////////////////////////////////////
// End serialport callbacks
///////////////////////////////////////////////////////////////////////////


osc1 = new p5.TriOsc(); // set frequency and type
osc1.amp(.5);
osc2 = new p5.TriOsc(); // set frequency and type
osc2.amp(.5);  
osc3 = new p5.TriOsc(); // set frequency and type
osc3.amp(.5);    

fft = new p5.FFT();
osc1.start();
osc2.start(); 
osc3.start();

// We are connected and ready to go
function serverConnected() {
  console.log("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
  console.log("List of Serial Ports:");
  // theList is an array of their names
  for (var i = 0; i < thelist.length; i++) {
    // Display in the console
    console.log(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  console.log("Serial Port is Open");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  console.log(theerror);
}



// There is data available to work with from the serial port
function gotData() {
  var currentString = serial.readLine();  // read the incoming string
  trim(currentString);                    // remove any trailing whitespace
  if (!currentString) return;             // if the string is empty, do no more
  console.log("currentString  ", currentString);             // println the string
  latestData = currentString;            // save it for the draw method
  console.log("latestData" + latestData);   //check to see if data is coming in
  splitter = split(latestData, ',');       // split each number using the comma as a delimiter
  //console.log("splitter[0]" + splitter[0]); 
  diameter0 = splitter[0];                 //put the first sensor's data into a variable
  diameter1 = splitter[1];
  diameter2 = splitter[2]; 



}

// We got raw data from the serial port
function gotRawData(thedata) {
  println("gotRawData" + thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device


//from https://openprocessing.org/sketch/1253474
function draw() {
  clear();
  background(0);
  randomSeed(seeed);
  blendMode(ADD)
  translate(width/2, height/2);
  let z = (frameCount%N_FRAMES)/N_FRAMES;
  
//sp= diameter 0*100 =button 
//n= diameter 1 =rotary potentionmeter
//h=diameter 2 =light (havent add yet)
  for (let i = 0; i < 5; i++) {
    stroke(random(colors));
    strokeWeight(random(2, 5));
    let n = floor(random(diameter1, diameter1));
//    *random([-1, 1]);
    let h = random(5, l/6);
		h *= -sq(2*z-1)+1;
    let sp = random([-3, -2, -2, -1, -1, -1, 1, 1, 1, 2, diameter0*100, diameter0*100]);
    makeWave(n, h, sp);
  }
  
  stroke(255);
  strokeWeight(4);
  circle(0, 0, l);
  
  if (frameCount % N_FRAMES === 0) {
    seeed = random(1000*frameCount);
  }
}

function makeWave(n, h, sp) {
  let t = TWO_PI*(frameCount%N_FRAMES)/N_FRAMES;
  beginShape();
  for (let x = -l/2; x < l/2; x++) {
    let z = map(x, -l/2, l/2, 0, 1);
    let alpha = -sq(2*z-1)+1;
    let off = sin(n*TWO_PI*(x+l/2)/l+sp*t)*h*alpha;
    curveVertex(x, off);
  }
  endShape();
    
var freq = map(diameter0, 0, width, 40, 880);    
    osc1.freq(freq);
    //console.log(freq);
    
var freq2 = map(diameter1, 0, width, 40, 880);    
    osc2.freq(freq2);
    //console.log(freq2);
    
var freq3 = map(diameter2*10, 0, width, 40, 880);    
    osc3.freq(freq3);
    //console.log(freq3); 
}
//from https://openprocessing.org/sketch/1253474



//the original coed 
//
//function draw() {}
//    
//  background(255,255,255);
//  text(latestData, 10,10);
//    
//  ellipseMode(RADIUS);    
//  fill(255,0,0);
//  noStroke(); 
//  //console.log("diameter0  "  + diameter0);
//  ellipse(100, 100, diameter0*100, diameter0*100);
//  ellipseMode(RADIUS);    
//  fill(0,255,0);
//  ellipse(200, 100, diameter1, diameter1);
//  ellipseMode(RADIUS);
//  fill(0,0,255);
//  ellipse(300, 100, diameter2, diameter2);
//    
//  
//  var freq = map(diameter0, 0, width, 40, 880);    
//    osc1.freq(freq);
//    //console.log(freq);
//    
//  var freq2 = map(diameter1, 0, width, 40, 880);    
//    osc2.freq(freq2);
//    //console.log(freq2);
//    
// var freq3 = map(diameter2*10, 0, width, 40, 880);    
//    osc3.freq(freq3);
//    //console.log(freq3); 
//}


function mouseClicked(){
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    console.log("getAudioContext().state" + getAudioContext().state);
  }
  };
  
console.log("%c p5.geolocation Loaded ", "color:pink; background:black; ");


/**
* Check if location services are available
*
* Returns true if geolocation is available
*
* @method locationCheck
* @return {boolean} true if geolocation is available
*/
p5.prototype.geoCheck = function(){
  if (navigator.geolocation) {
    return true;
  }else{
    return false;
  }

}

/**
* Get User's Current Position
*
* Gets the users current position. Can be used in preload(), or as a callback.
*
* @method getCurrentPosition
* @param  {function} a callback to handle the current position data
* @param  {function} a callback to handle an error
* @return {object} an object containing the users position data
*/
p5.prototype.getCurrentPosition = function(callback, errorCallback) {

  var ret = {};
  var self = this;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoError);
  }else{
    geoError("geolocation not available");
  };

  function geoError(message){
    console.log(message.message);
    ret.error = message.message;
    if(typeof errorCallback == 'function'){ errorCallback(message.message) };
  }

  function success(position){
      // console.log(position);

      //get the entire position object....
      // //see the p5.js github libraries wiki page for more info on what is going on here.
      // for(var k in position){
      //   if (typeof position[k] == 'object'){
      //     ret[k] = {};
      //     for(var x in position[k]){
      //       ret[k][x] = position[k][x];
      //     }
      //   } else {
      //     ret[k] = position[k];
      //   }
      // }

      //get only the coords part of the position object
    for(var x in position.coords){
      ret[x] = position.coords[x];
      ret['timestamp'] = position.timestamp;
    }
    if (typeof self._decrementPreload === 'function') { self._decrementPreload() };
    if(typeof callback == 'function'){ callback(position.coords) };
  }

  return ret;
};

//add the get Current position to the preload stack.
p5.prototype.registerPreloadMethod('getCurrentPosition', p5.prototype);

/**
* Get User's Current Position on an interval
*
* Gets the users current position on an interval. Can be useful if watchPosition is not responsive enough. This can be a resource hog (read:battery) as it is calling the getPosition at the rate of your interval. Set it long for less intense usage.
*
* @method getCurrentPosition
* @param  {function} a callback to handle the current position data
* @param  {function} an interval in MS
* @param  {function} a callback to handle an error
*/
p5.prototype._intervalPosition = null;
p5.prototype.intervalCurrentPosition = function(callback, interval,  errorCallback){

  var gogogadget = 5000;
  gogogadget = interval;

  if (navigator.geolocation) {

    _intervalPosition = setInterval(function(){

      console.log("pos");
      navigator.geolocation.getCurrentPosition(success, geoError);

    }, gogogadget)

  }else{
    geoError("geolocation not available");
  };

    function geoError(message){
      console.log(message.message);
       if(typeof errorCallback == 'function'){ errorCallback(message.message) };
    }

    function success(position){
      if(typeof callback == 'function'){ callback(position.coords) };
    }
}

/**
* Clear interval Position
*
* clears the current intervalCurrentPosition()
*
* @method clearIntervalPos()
*/
p5.prototype.clearIntervalPos = function(){
  window.clearInterval(_intervalPosition);
}

/**
* Watch User's Current Position
*
* Watches the users current position
*
* @method watchPosition
* @param  {function} a callback to handle the current position data
* @param  {function} a callback to handle an error
* @param  {object} an positionOptions object: enableHighAccuracy, maximumAge, timeout
*/
p5.prototype._posWatch = null;
p5.prototype.watchPosition = function(callback, errorCallback, options){

  if (navigator.geolocation) {
    _posWatch = navigator.geolocation.watchPosition(success, geoError, options);
  }else{
    geoError("geolocation not available");
  };

  function geoError(message){
      console.log("watch Postition Error" + message);
       if(typeof errorCallback == 'function'){ errorCallback(message.message) };
    }

  function success(position){
        if(typeof callback == 'function'){ callback(position.coords) };
        // console.log(_posWatch);
  }

}

/**
* Clear the watchPosition
*
* clears the current watchPosition
*
* @method clearWatch
*/
p5.prototype.clearWatch = function(){
  navigator.geolocation.clearWatch( _posWatch );
}

/**
* Calculate the Distance between two points
*
*
* @method watchPosition
* @param  {float} latitude of the first point
* @param  {float} longitude of the first point
* @param  {float} latitude of the second point
* @param  {float} longitude of the second point
* @param  {string} units to use: 'km' or 'mi', 'mi' is default if left blank
* @return {float} the distance between the two points in the specified units, miles is default
*/

// http://www.movable-type.co.uk/scripts/latlong.html
// Used Under MIT License
p5.prototype.calcGeoDistance = function(lat1, lon1, lat2, lon2, units) {
  if(units == 'km'){
     var R = 6371; //earth radius in KM
  }else{
    var R = 3959; // earth radius in Miles (default)
  }
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }


/**
* Calculate if a Location is inside Polygon
*
*
* @method watchPosition
* @param  {float} Array of Objects with lat: and lon:
* @param  {float} Object with lat and long of my location
* @return {boolean} true if geolocation is within polygon
*/

// http://jsfromhell.com/math/is-point-in-poly
// Adapted from: [http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html]
// Used Under MIT License
p5.prototype.isLocationInPolygon = function(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].lon <= pt.lon && pt.lon < poly[j].lon) || (poly[j].lon <= pt.lon && pt.lon < poly[i].lon))
        && (pt.lat < (poly[j].lat - poly[i].lat) * (pt.lon - poly[i].lon) / (poly[j].lon - poly[i].lon) + poly[i].lat)
        && (c = !c);
    return c;
}



/**
* Create a new geoFenceCircle
*
* Watches the users current position and checks to see if they are witihn a set radius of a specified point.
*
* @method watchPosition
* @param  {float} latitude of the first point
* @param  {float} longitude of the first point
* @param  {float} distance from the point to trigger the insideCallback
* @param  {function} a callback to fire when the user is inside the geoFenceCircle
* @param  {function} a callback to fire when the user is outside the geoFenceCircle
* @param  {string} units to use: 'km' or 'mi', 'mi' is default if left blank
* @param  {object} an positionOptions object: enableHighAccuracy, maximumAge, timeout
*/
p5.prototype.geoFenceCircle = function(lat, lon, fence, insideCallback, outsideCallback, units, options){

  this.lat = lat;
  this.lon = lon;
  this.fence = fence;
  this.units = units; //this should work since calcGeoDistance defaults to miles.
  this.distance = 0.0;
  this.insideCallback = insideCallback;
  this.outsideCallback = outsideCallback;
  this.insideFence = false;
  this.options = options;
  this.id = '';

    this.geoError = function(message){
      console.log("geoFenceCircle Error :" + message);
    }

    this.success = function(position){
      this.distance = calcGeoDistance(this.lat,this.lon, position.coords.latitude, position.coords.longitude, this.units);

      if(this.distance <= this.fence){
          if(typeof this.insideCallback == 'function'){ this.insideCallback(position.coords) };
          this.insideFence = true;
      }else{
        if(typeof this.outsideCallback == 'function'){ this.outsideCallback(position.coords) };
        this.insideFence = false;
      }
    }

    this.clear = function() {
      if (this.id) {
        navigator.geolocation.clearWatch(this.id);
        this.id = '';
      }
    }

    if (navigator.geolocation) {
      // bind the callbacks to the geoFenceCircle 'this' so we can access, this.lat, this.lon, etc..
      this.id = navigator.geolocation.watchPosition(this.success.bind(this), this.geoError.bind(this), this.options);
    }else{
      geoError("geolocation not available");
    };
}





/**
* Create a new geoFencePolygon
*
* Watches the users current position and checks to see if they are witihn a set radius of a specified point.
*
* @method watchPosition
* @param  {float} latitude of the first point
* @param  {float} longitude of the first point
* @param  {float} distance from the point to trigger the insideCallback
* @param  {function} a callback to fire when the user is inside the geoFenceCircle
* @param  {function} a callback to fire when the user is outside the geoFenceCircle
* @param  {string} units to use: 'km' or 'mi', 'mi' is default if left blank
* @param  {object} an positionOptions object: enableHighAccuracy, maximumAge, timeout
*/


/*var points = [
    {x: 34.076089, y: -118.440915},
    {x: 34.076095, y: -118.440605},
    {x: 34.075906, y: -118.440597},
    {x: 34.075891, y: -118.440932},
];*/
p5.prototype.geoFencePolygon = function( ArrayOfObjectsWithLatLong, insideCallback, outsideCallback, units, options){

  this.ArrayOfObjectsWithLatLong = ArrayOfObjectsWithLatLong;
  this.units = units; //this should work since calcGeoDistance defaults to miles.
  this.insideCallback = insideCallback;
  this.outsideCallback = outsideCallback;
  this.insideFence = false;
  this.options = options;
  this.id = '';

    this.geoError = function(message){
      console.log("geoFencePolygon Error :" + message);
    }

    this.success = function(position){
      this.insideFence = isLocationInPolygon(this.ArrayOfObjectsWithLatLong, { lat:position.coords.latitude, lon: position.coords.longitude });

      if(this.insideFence == true){
          if(typeof this.insideCallback == 'function'){ this.insideCallback(position.coords) };
      }else{
        if(typeof this.outsideCallback == 'function'){ this.outsideCallback(position.coords) };
      }
    }

    this.clear = function() {
      if (this.id) {
        navigator.geolocation.clearWatch(this.id);
        this.id = '';
      }
    }

    if (navigator.geolocation) {
      // bind the callbacks to the geoFenceCircle 'this' so we can access, this.lat, this.lon, etc..
      this.id = navigator.geolocation.watchPosition(this.success.bind(this), this.geoError.bind(this), this.options);
    }else{
      geoError("geolocation not available");
    };
}


  

 