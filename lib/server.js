/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var associationManager = require('./associationmanager');
var placeManager = require('./placemanager');
var responseHandler = require('./responsehandler');

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

  this.associations = new associationManager();
  this.places = new placeManager();

  this.app = express();
  this.app.use(bodyParser.urlencoded({ extended: true }));
  this.app.use(bodyParser.json());

  this.router = express.Router();
  this.router.use(function(req, res, next) {
    // TODO: basic error checking goes here in the middleware
    next();
  });

  // ----- route: /id ------
  this.router.route('/id')

    .get(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .post(function(req, res) {
      self.associations.add(req.body.identifier, req.body.url, function() {
        res.json( responseHandler.prepareResponse("created") );
      });
    });

  // ----- route: /id/:id ------
  this.router.route('/id/:id')

    .get(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .put(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .delete(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    });

  // ----- route: /at ------
  this.router.route('/at')

    .get(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .post(function(req, res) {
      self.places.add(req.body.place, req.body.ids, function() {
        res.json( responseHandler.prepareResponse("created") );
      });
    });

  // ----- route: /at/:place ------
  this.router.route('/at/:place')

    .get(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .put(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    })

    .delete(function(req, res) {
      res.json( responseHandler.prepareFailureResponse("notImplemented") );
    });

  this.app.use('/', self.router);

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


module.exports = Chickadee;
