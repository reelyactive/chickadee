/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var responseHandler = require('./responsehandler');

var HTTP_PORT = 3001;


/**
 * Chickadee Class
 * API for real-time hyperlocal context.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Chickadee(options) {
  var self = this;
  options = options || {};
  this.specifiedHttpPort = options.httpPort || HTTP_PORT;
  this.httpPort = process.env.PORT || this.specifiedHttpPort;

  this.app = express();

  this.app.get('/id/:id', function(req, res) {
    //searchByIDs(self, getRequestParameters(req), function(result) {
      res.json(responseHandler.prepareFailureResponse("notFound"));
    //});
  });

  this.app.get('/at/:place', function(req, res) {
    //searchByPlace(self, getRequestParameters(req), function(result) {
      res.json(responseHandler.prepareFailureResponse("notFound"));
    //});
  });

  console.log("reelyActive Chickadee instance is curious about hyperlocal context in an open IoT");

  this.app.listen(this.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
};


/**
 * Bind the contextual API to the given infrastructure API.
 * @param {Object} options The options as a JSON object.
 */
Chickadee.prototype.bind = function(options) {
  options = options || {};
  var self = this;

  if(options.barterer) {
    self.infrastructureApi = options.barterer;
  }  
}


/**
 * Return the API request parameters as an object.
 * @param {Object} req The request.
 */
function getRequestParameters(req) {
  var params = {};
  params.ids = [ req.param('id') ];
  params.place = req.param('place');
  params.rootUrl = req.protocol + '://' + req.get('host');
  params.queryPath = req.originalUrl;
  params.body = req.body;
  return params;
}


module.exports = Chickadee;
