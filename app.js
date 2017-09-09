var express = require('express')
var request = require('request')
var app = express()
var port = process.env.PORT || 5000;
var server = require('http').createServer(app);
app.use(express.static('static'));

var googleAPI = "AIzaSyBxKo4_btFVqD3KhYiQ6XxaskHFe-S_TKY";
var directionsEndpoint = "https://maps.googleapis.com/maps/api/directions/json"

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
  })
});
app.get("/events", function(req, res) {

  var dummy = [
    {"title":"The greatest event",
      "location":"4567 your mom's house",
      "details": "come here plz",
      "summary":"K",
      "image":"www.google.com"},
    {"title":"The greatest event 2",
      "location":"4567 your mom's house",
      "details": "come here plz",
      "summary":"K",
      "image":"www.google.com"}
  ]
  res.send(dummy);
});


server.listen(port, function () {
  console.log("server running on port: " + port.toString())
})

