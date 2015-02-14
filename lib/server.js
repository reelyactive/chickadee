/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var associationManager = require('./associationmanager');
var placeManager = require('./placemanager');

var HTTP_PORT = 3004;


/**
 * Chickadee Class
 * Hyperlocal context associations store.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Chickadee(options) {
  var self = this;
  options = options || {};
  this.specifiedHttpPort = options.httpPort || HTTP_PORT;
  this.httpPort = process.env.PORT || this.specifiedHttpPort;

  this.app = express();
  this.associations = new associationManager();
  this.places = new placeManager();

  this.app.use(bodyParser.urlencoded({ extended: false }));

  this.app.post('/associate', function(req, res) {
    handlePost(self, req, function(status) {
      res.json(status);
    });
  });

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");

  this.app.listen(this.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
};


/**
 * Make all known device associations by adding the corresponding URLs.
 * @param {Object} identifiers The list of identifiers to associate.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.addUrls = function(identifiers, callback) {
  identifiers = identifiers || {};
  var self = this;

  self.associations.addUrls(identifiers, callback);
}


/**
 * Get all device identifiers associated with the given place.
 * @param {String} place The name of the place.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getPlaceIDs = function(place, callback) {
  place = place || "";
  var self = this;

  self.places.getIDs(place, callback);
}


/**
 * Handle POST action.
 * @param {Chickadee} instance The given Chickadee instance.
 * @param {Object} req The given request.
 * @param {function} callback Function to call on completion.
 */
function handlePost(instance, req, callback) {
  var post = req.body;
  switch(post.action) {
    case("device"):
      instance.associations.add(post.identifier, post.url);
      callback( {  "_meta": { "message": "created", "statusCode": 201 } } );
      break;
    case("place"):
      instance.places.add(post.place, post.ids);
      callback( {  "_meta": { "message": "created", "statusCode": 201 } } );
      break;
    default:
      callback( {  "_meta": { "message": "bad request", "statusCode": 400 } } );
  }
}


module.exports = Chickadee;
