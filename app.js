var express = require('express')
var app = express()
var port = process.env.PORT || 5000;
var server = require('http').createServer(app);
app.use(express.static('static'));


server.listen(port, function () {
  console.log("server running on port: " + port.toString())
})