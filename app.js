var express = require('express')
var request = require('request')
var app = express()
var port = process.env.PORT || 5000;
var server = require('http').createServer(app);
app.use(express.static('static'));
var io = require('socket.io')(server);
var googleAPI = "AIzaSyBxKo4_btFVqD3KhYiQ6XxaskHFe-S_TKY";
var directionsEndpoint = "https://maps.googleapis.com/maps/api/directions/json"

var events = [
  {"title":"The greatest event",
    "id":"1023",
    "location":"4567 Orange Jungle Drive",
    "date": "September 9, 2016",
    "details": "come here plz",
    "summary":"K",
    "image":"http://materializecss.com/images/sample-1.jpg"},
  {"title":"The greatest event 2",
    "id":"10293",
    "location":"4567 Orange Jungle Drive",
    "date": "September 9, 2016",
    "details": "come here plz",
    "summary":"K",
    "image":"http://materializecss.com/images/sample-1.jpg"}
];


app.get("/directions", function(req, res) {
  console.log(req.query);
  var options = {"url": directionsEndpoint,
  qs:{"origin": req.query["origin"],
  "destination": req.query["destination"],
  "transit_mode": "subway",
  json:true,
  "key":googleAPI}};

  request.get(options, function(error, response, body) {
    results = JSON.parse(body)    
    if (results.status == "ZERO_RESULTS") {
      res.send({status: "error"})
    } else {
      console.log(results.routes[0].legs.length)
      var duration = results.routes[0].legs[0].duration.text;
      var distance = results.routes[0].legs[0].distance.text;

      console.log(duration);
      console.log(distance);
      retObj = {}
      retObj["distance"] = distance;
      retObj["duration"] = duration;
      retObj["directions"] = results.routes[0].legs[0].steps;
      res.send(retObj);

    }
  });
});

app.get("/events", function(req, res) {

  res.send(events);
});

app.get("/tracking", function(req, res) {
  
  res.sendFile('static/tracking.html' , { root : __dirname})
})


server.listen(port, function () {
  console.log("server running on port: " + port.toString())
});

var users = {};

io.on('connection', function (socket) {
  users[socket.id] = {}
  socket.emit('init', { hello: 'world' });
  socket.on('init', function (data) {
    // search for event in our list and add params
  });

  socket.on("init", function(data) {
    users[socket.id] = data;
    console.log(data);
    var origin = users[socket.id]["location"]["lat"] + "," + users[socket.id]["location"]["long"];
    console.log(getEvent(users[socket.id]["params"]["id"]));
    
    var destination = getEvent(users[socket.id]["params"]["id"]).location;
    getDirections(origin, destination, function(dir) {
      users[socket.id]["tracking"] = dir;
      users[socket.id]["statusIndex"] = 0;
      socket.emit("dir", {"dir":dir, "statusIndex":users[socket.id]["statusIndex"]});
    });



  });



  socket.on("update", function(data) {
    
    for (var i = 0; i < events.length; i++) {
    }

  });
});

function getDirections(origin, destination, callback){
  var options = {"url": directionsEndpoint,
  qs:{"origin": origin,
  "destination": destination,
  "transit_mode": "subway",
  json:true,
  "key":googleAPI}};

  request.get(options, function(error, response, body) {
    results = JSON.parse(body)    
    if (results.status == "ZERO_RESULTS") {
      callback({status: "error"})
    } else {
      console.log(results.routes[0].legs.length)
      var duration = results.routes[0].legs[0].duration.text;
      var distance = results.routes[0].legs[0].distance.text;

      console.log(duration);
      console.log(distance);
      retObj = {}
      retObj["distance"] = distance;
      retObj["duration"] = duration;
      retObj["directions"] = results.routes[0].legs[0].steps;
      retObj["status"] = "OK";
      callback(retObj);

    }
  });
}

function getEvent(eventID) {
  for (var i = 0; i < events.length; i++) {
    if (events[i].id == eventID) {
      return events[i];
    }
  }
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

