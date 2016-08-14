/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var path = require('path');
var reelib = require('reelib');
var associationManager = require('./associationmanager');
var responseHandler = require('./responsehandler');


/**
 * Chickadee Class
 * Hyperlocal context associations store and API.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Chickadee(options) {
  var self = this;
  options = options || {};

  self.associations = options.associationManager ||
                      new associationManager(options);

  self.routes = {
    "/associations": require('./routes/associations'),
    "/contextat": require('./routes/contextat'),
    "/contextnear": require('./routes/contextnear'),
    "/": express.static(path.resolve(__dirname + '/../web'))
  };

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");
}


/**
 * Configure the routes of the API.
 * @param {Object} options The options as a JSON object.
 */
Chickadee.prototype.configureRoutes = function(options) {
  options = options || {};
  var self = this;

  if(options.app) {
    var app = options.app;

    app.use(function(req, res, next) {
      req.chickadee = self;
      next();
    });

    for(var mountPath in self.routes) {
      var router = self.routes[mountPath];
      app.use(mountPath, router);
    }
  }
};


/**
 * Bind the API to the given data source.
 * @param {Object} options The options as a JSON object.
 */
Chickadee.prototype.bind = function(options) {
  options = options || {};
  var self = this;

  if(options.barnacles) {
    self.dataStore = options.barnacles;
  }
};


/**
 * Get the context of the given device(s) based on the given options.
 * @param {Object} req The request which originated this function call.
 * @param {Object} options The query options.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getDevicesContext = function(req, options, rootUrl,
                                                 queryPath, callback) {
  var self = this;
  var status;
  var response;

  if(self.dataStore) {
    convertOptionsParamsToIds(req, self, options, function(err) {
      if(!err) {
        self.dataStore.getState(options, function(state) {
          self.associations.addAssociations(req, state, function(context) {
            status = responseHandler.OK;
            response = responseHandler.prepareResponse(status, rootUrl,
                                                       queryPath, context);
            return callback(response, status);
          });
        });
      }
      else {
        status = responseHandler.BADREQUEST;
        response = responseHandler.prepareResponse(status, rootUrl, queryPath);
        return callback(response, status);
      }
    });
  }
  else {
    status = responseHandler.SERVICEUNAVAILABLE;
    response = responseHandler.prepareResponse(status, rootUrl, queryPath);
    return callback(response, status);
  }
};


/**
 * Get existing associations.
 * @param {Object} req The request which originated this function call.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getAssociations = function(req, rootUrl, queryPath,
                                               callback) {
  var self = this;
  var status;
  var response;

  self.associations.retrieveMany(req, function(err, devices) {
    if(devices && (!err)) {
      status = responseHandler.OK;
      return callback(devices, status);
    }
    else if(err) {
      status = responseHandler.NOTIMPLEMENTED;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      return callback(response, status);
    }
    else {
      status = responseHandler.NOTFOUND;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      return callback(response, status);
    }
  });
};


/**
 * Get an existing association.
 * @param {Object} req The request which originated this function call.
 * @param {String} id The id of the device association.
 * @param {String} property A specific association property to get.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getAssociation = function(req, id, property, rootUrl,
                                              queryPath, callback) {
  var self = this;
  var status;
  var response;

  self.associations.retrieve(req, id, property, function(err, id, device) {
    if(device && (!err)) {
      var data = { devices: {} };
      data.devices[id] = device;
      status = responseHandler.OK;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath,
        data);
      callback(response, status);
    }
    else if(err) {
      status = responseHandler.BADREQUEST;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
    else {
      status = responseHandler.NOTFOUND;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
  });
};


/**
 * Update an existing association.
 * @param {Object} req The request which originated this function call.
 * @param {String} id The id of the device association.
 * @param {String} url The URL associated with the device.
 * @param {String} directory The directory associated with the device.
 * @param {Array} tags The tags associated with the device.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.setAssociation = function(req, id, url, directory, tags,
                                              rootUrl, queryPath, callback) {
  var self = this;
  var status;
  var response;

  self.associations.replace(req, id, url, directory, tags,
                            function(err, id, device) {
    if(!err) {
      var data = { devices: {} };
      data.devices[id] = device;
      status = responseHandler.OK;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath,
                                                 data);
      callback(response, status);
    }
    else {
      status = responseHandler.BADREQUEST;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
  });
};


/**
 * Remove an existing association.
 * @param {Object} req The request which originated this function call.
 * @param {String} id The id of the device association.
 * @param {String} property A specific association property to remove.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.removeAssociation = function(req, id, property, rootUrl,
                                                 queryPath, callback) {
  var self = this;
  var status;
  var response;

  self.associations.remove(req, id, property, function(err) {
    if(!err) {
      status = responseHandler.OK;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
    else {
      status = responseHandler.BADREQUEST;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
  });
};


/**
 * Find and append all associations for each device identifier in the state
 * @param {Object} state State of devices.
 * @param {function} callback Function to call on completion.
 */
Chickadee.prototype.addAssociations = function(state, callback) {
  var self = this;

  self.associations.addAssociations(null, state, callback);
};


/**
 * Convert the id, directory or tags within options to ids.
 * @param {Object} req The request which originated this function call.
 * @param {Chickadee} instance The given chickadee instance.
 * @param {Object} options The given options.
 * @param {callback} callback Function to call on completion.
 */
function convertOptionsParamsToIds(req, instance, options, callback) {
  var err;

  if(options.id) {
    var isValidID = reelib.identifier.isValid(options.id);
    if(!isValidID) {
      err = 'Invalid id';
    }
    options.ids = [options.id];
    delete options.id;
    callback(err);
  }
  else if(options.directory) {
    instance.associations.retrieveIdsByParams(req, options.directory, null,
                                              function(ids) {
      options.ids = ids;
      delete options.directory;
      callback(err);
    });
  }
  else if(options.tags) {
    instance.associations.retrieveIdsByParams(req, null, options.tags,
                                              function(ids) {
      options.ids = ids;
      delete options.tags;
      callback(err);
    });
  }
}


module.exports.Chickadee = Chickadee;
module.exports.makeExternalAssociation =
  associationManager.makeExternalAssociation;
module.exports.extractRadioDecoders = associationManager.extractRadioDecoders;
