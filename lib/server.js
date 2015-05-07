/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var associationManager = require('./associationmanager');
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

  self.app = express();
  self.app.use(bodyParser.urlencoded({ extended: true }));
  self.app.use(bodyParser.json());

  self.app.use(function(req, res, next) {
    req.instance = self;
    next();
  });

  self.app.use('/contextat', require('./routes/contextat'));
  self.app.use('/contextnear', require('./routes/contextnear'));
  self.app.use('/associations', require('./routes/associations'));
  self.app.use('/', express.static(path.resolve(__dirname + '/../web')));

  console.log("reelyActive Chickadee instance is curious to associate metadata in an open IoT");

  self.app.listen(self.httpPort, function() {
    console.log("chickadee is listening on port", self.httpPort);
  });
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
}


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
    convertOptionsTagToIds(self, options, function() {
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
}


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

  self.associations.retrieve(id, property, function(err, id, device) {
    if(device && (!err)) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else if(err) {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.NOTFOUND;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status); 
    }
  });
}


/**
 * Update an existing association.
 * @param {String} id The id of the device association.
 * @param {String} url The URL associated with the device.
 * @param {Array} tag The tag associated with the device.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Chickadee.prototype.setAssociation = function(id, url, tag, rootUrl,
                                              queryPath, callback) {
  var self = this;

  self.associations.replace(id, url, tag, function(err, id, device) {
    if(!err) {
      var data = { devices: { } };
      data.devices[id] = device;
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, data);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath); 
      callback(response, status);
    }
  });
}


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

  self.associations.remove(id, property, function(err) {
    if(!err) {
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.BADREQUEST;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath)
      callback(response, status);
    }
  });
}


/**
 * Convert tag within options to Ids, if applicable.
 * @param {Chickadee} instance The given chickadee instance.
 * @param {Object} options The given options.
 * @param {callback} callback Function to call on completion.
 */
function convertOptionsTagToIds(instance, options, callback) {
  var ids = [];
  var tags = [];
  for(var cTag = 0; cTag < options.tag.length; cTag++) {
    var tagOrId = options.tag[cTag];
    if((tagOrId.length === 12) || (tagOrId.length === 16)) {
      ids.push(tagOrId);
    }
    else {
      tags.push(tagOrId);
    }
  }
  delete options.tag;
  if(tags.length > 0) {
    instance.associations.retrieveTagIds(tags, function(tagIds) {
      options.ids = ids.concat(tagIds);
      callback();
    });
  }
  else {
    options.ids = ids;
    callback();
  }
}


module.exports = Chickadee;
