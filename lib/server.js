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
  self.specifiedHttpPort = options.httpPort || HTTP_PORT;
  self.httpPort = process.env.PORT || self.specifiedHttpPort;

  self.associations = new associationManager();
  self.places = new placeManager();

  self.app = express();
  self.app.use(bodyParser.urlencoded({ extended: true }));
  self.app.use(bodyParser.json());

  self.router = express.Router();
  self.router.use(function(req, res, next) {
    // TODO: basic error checking goes here in the middleware
    next();
  });

  // ----- route: /id ------
  self.router.route('/id')

    .get(function(req, res) {
      if(Object.keys(req.query).length === 0) {
        routeNotImplemented(function(response, status) {
          res.status(status).json(response);
        });
      }
      else {
        var parameters = { value: req.query.value };
        self.retrieveDevice(null, parameters, req, function(response, status) {
          res.status(status).json(response);
        });
      }
    })

    .post(function(req, res) {
      var identifier = req.body.identifier;
      var url = req.body.url;
      self.createDevice(identifier, url, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /id/:id ------
  self.router.route('/id/:id')

    .get(function(req, res) {
      var id = req.param('id');
      self.retrieveDevice(id, null, req, function(response, status) {
        res.status(status).json(response);
      });
    })

    .put(function(req, res) {
      var id = req.param('id');
      var identifier = req.body.identifier;
      var url = req.body.url;
      self.replaceDevice(id, identifier, url, req, function(response, status) {
        res.status(status).json(response);
      });
    })

    .delete(function(req, res) {
      var id = req.param('id');
      self.deleteDevice(id, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /at ------
  self.router.route('/at')

    .get(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    })

    .post(function(req, res) {
      var place = req.body.place;
      var identifiers = req.body.identifiers;
      self.createPlace(place, identifiers, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /at/:place ------
  self.router.route('/at/:place')

    .get(function(req, res) {
      var place = req.param('place');
      self.retrievePlace(place, req, function(response, status) {
        res.status(status).json(response);
      });
    })

    .put(function(req, res) {
      var place = req.param('place');
      var identifiers = req.body.identifiers;
      self.replacePlace(place, identifiers, req, function(response, status) {
        res.status(status).json(response);
      });
    })

    .delete(function(req, res) {
      var place = req.param('place');
      self.deletePlace(place, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  self.app.use('/', self.router);

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");

  self.app.listen(self.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
};


/**
 * Create a new device association.
 * @param {Object} identifier The unique identifier of the device.
 * @param {String} url The URL associated with the device.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.createDevice = function(identifier, url, req, callback) {
  var self = this;

  self.associations.create(identifier, url, function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.CREATED;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Retrieve (get) an existing device association.
 * @param {String} id The id of the device association.
 * @param {Object} parameters The parameters to search on.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.retrieveDevice = function(id, parameters, req, callback) {
  var self = this;

  self.associations.retrieve(id, parameters, function(err, id, device) {
    if(device && (!err)) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      callback(responseHandler.prepareResponse(status), status); 
    }
  });
}


/**
 * Update an existing device association.
 * @param {String} id The id of the device association.
 * @param {Object} identifier The unique identifier of the device.
 * @param {String} url The URL associated with the device.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.replaceDevice = function(id, identifier, url, req, callback) {
  var self = this;

  self.associations.replace(id, identifier, url, function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Delete an existing device association.
 * @param {String} id The id of the device association.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.deleteDevice = function(id, req, callback) {
  var self = this;

  self.associations.remove(id, function(err) {
    if(!err) {
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req), status);
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
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.createPlace = function(place, identifiers, req, callback) {
  var self = this;

  self.places.create(place, identifiers, function(err, id, place) {
    if(!err) {
      var data = { places: { } };
      data.places[id] = place;
      var status = responseHandler.CREATED;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Retrieve (get) the association for the given place.
 * @param {String} place The name of the place.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.retrievePlace = function(name, req, callback) {
  var self = this;

  self.places.retrieve(name, function(err, id, place) {
    if(place && (!err)) {
      var data = { places: { } };
      data.places[name] = place;
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      callback(responseHandler.prepareResponse(status), status); 
    }
  });
}


/**
 * Update an existing place association.
 * @param {String} place The unique name of the place.
 * @param {Array} identifiers The unique identifiers associated with the place.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.replacePlace = function(place, identifiers, req, callback) {
  var self = this;

  self.places.replace(place, identifiers, function(err, id, place) {
    if(!err) {
      var data = { places: { } };
      data.places[id] = place;
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req, data), status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
  });
}


/**
 * Delete an existing place association.
 * @param {String} place The unique name of the place.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.deletePlace = function(place, req, callback) {
  var self = this;

  self.places.remove(place, function(err) {
    if(!err) {
      var status = responseHandler.OK;
      callback(responseHandler.prepareResponse(status, req), status);
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
// TODO: make this RESTful
Chickadee.prototype.addUrls = function(identifiers, callback) {
  identifiers = identifiers || {};
  var self = this;

  self.associations.addUrls(identifiers, callback);
}


/**
 * Get the association for the given place.
 * @param {String} name The name of the place.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getPlace = function(name, callback) {
  var self = this;

  self.places.retrieve(name, function(err, id, place) {
    if(place && (!err)) {
      var data = { places: { } };
      data.places[name] = place;
      var status = responseHandler.OK;
      callback(data, status); // TODO: use updated responseHandler
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      callback(responseHandler.prepareResponse(status), status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      callback(responseHandler.prepareResponse(status), status); 
    }
  });
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
