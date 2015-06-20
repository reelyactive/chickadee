/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var path = require('path');
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
                      new associationManager();

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
 * @param {Object} options The query options.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getDevicesContext = function(options, rootUrl, queryPath,
                                                 callback) {
  var self = this;

  if(self.dataStore) {
    convertOptionsParamsToIds(self, options, function() {
      self.dataStore.getState(options, function(state) {
        self.associations.addUrls(state, function(context) {
          var status = responseHandler.OK;
          var response = responseHandler.prepareResponse(status, rootUrl,
                                                         queryPath, context);
          callback(response, status);
        });
      });
    });
  }
  else {
    var status = responseHandler.SERVICEUNAVAILABLE;
    var response = responseHandler.prepareResponse(status, rootUrl,
                                                   queryPath);
    callback(response, status);
  }
};


/**
 * Get an existing association.
 * @param {String} id The id of the device association.
 * @param {String} property A specific association property to get.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.getAssociation = function(id, property, rootUrl, queryPath,
                                              callback) {
  var self = this;
  var status;
  var response;

  self.associations.retrieve(id, property, function(err, id, device) {
    if(device && (!err)) {
      var data = { devices: { } };
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
 * @param {String} id The id of the device association.
 * @param {String} url The URL associated with the device.
 * @param {String} directory The directory associated with the device.
 * @param {Array} tags The tags associated with the device.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.setAssociation = function(id, url, directory, tags,
                                              rootUrl, queryPath, callback) {
  var self = this;
  var status;
  var response;

  self.associations.replace(id, url, directory, tags,
                            function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
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
 * @param {String} id The id of the device association.
 * @param {String} property A specific association property to remove.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.removeAssociation = function(id, property, rootUrl,
                                                 queryPath, callback) {
  var self = this;
  var status;
  var response;

  self.associations.remove(id, property, function(err) {
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
 * Convert the id, directory or tags within options to ids.
 * @param {Chickadee} instance The given chickadee instance.
 * @param {Object} options The given options.
 * @param {callback} callback Function to call on completion.
 */
function convertOptionsParamsToIds(instance, options, callback) {
  if(options.id) {
    options.ids = [ options.id ];
    delete options.id;
    callback();
  }
  else if(options.directory) {
    instance.associations.retrieveIdsByParams(options.directory, null,
                                              function(ids) {
      options.ids = ids;
      delete options.directory;
      callback();
    });
  }
  else if(options.tags) {
    instance.associations.retrieveIdsByParams(null, options.tags,
                                              function(ids) {
      options.ids = ids;
      delete options.tags;
      callback();
    });
  }
}


module.exports.Chickadee = Chickadee;
module.exports.makeExternalAssociation =
                                   associationManager.makeExternalAssociation;
module.exports.extractRadioDecoders = associationManager.extractRadioDecoders;
