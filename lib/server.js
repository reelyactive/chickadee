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
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .post(function(req, res) {
      var identifier = req.body.identifier;
      var url = req.body.url;
      self.createDevice(identifier, url, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /id/:id ------
  this.router.route('/id/:id')

    .get(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .put(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .delete(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /at ------
  this.router.route('/at')

    .get(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .post(function(req, res) {
      var place = req.body.place;
      var ids = req.body.ids;
      self.createPlace(place, ids, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /at/:place ------
  this.router.route('/at/:place')

    .get(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .put(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .delete(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    });

  this.app.use('/', self.router);

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");

  this.app.listen(this.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
};


/**
 * Create a new device association.
 * @param {String} identifier The unique identifier of the device.
 * @param {String} url The URL associated with the device.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.createDevice = function(identifier, url, callback) {
  var self = this;

  self.associations.add(identifier, url, function(err) {
    if(!err) {
      var status = responseHandler.CREATED;
      callback(responseHandler.prepareResponse(status), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Create a new place association.
 * @param {String} place The unique name of the place.
 * @param {Array} identifiers The unique identifiers associated with the place.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.createPlace = function(place, identifiers, callback) {
  var self = this;

  self.places.add(place, identifiers, function(err) {
    if(!err) {
      var status = responseHandler.CREATED;
      callback(responseHandler.prepareResponse(status), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


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
 * Handle a route that is not implemented.
 * @param {callback} callback Function to call on completion.
 */
function routeNotImplemented(callback) {
  callback(responseHandler.prepareResponse(responseHandler.NOTIMPLEMENTED),
           responseHandler.NOTIMPLEMENTED);
}


module.exports = Chickadee;
