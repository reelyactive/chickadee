/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var chickadee = require('./chickadee');
var Chickadee = chickadee.Chickadee;


var HTTP_PORT = 3004;


/**
 * ChickadeeServer Class
 * Server for chickadee, returns an instance of chickadee with its own Express
 * server listening on the given port.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function ChickadeeServer(options) {
  options = options || {};
  var specifiedHttpPort = options.httpPort || HTTP_PORT;
  var httpPort = process.env.PORT || specifiedHttpPort;

  var app = express();
  options.app = app;
  var instance = new Chickadee(options);

  app.listen(httpPort, function() {
    console.log("chickadee is listening on port", httpPort);
  });

  return instance;
};


module.exports = ChickadeeServer;
module.exports.Chickadee = Chickadee;
