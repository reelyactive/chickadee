/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var responseHandler = require('../responsehandler');


var router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrieveDevices(req, res);
  })
  .post(function(req, res) {
    createDevice(req, res);
  });


router.route('/:id')
  .get(function(req, res) {
    retrieveDevice(req, res);
  })
  .put(function(req, res) {
    replaceDevice(req, res);
  })
  .delete(function(req, res) {
    deleteDevice(req, res);
  });


/**
 * Retrieve all devices.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevices(req, res) {
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var hasQueryString = (Object.keys(req.query).length === 0);

  if(hasQueryString) {
    var parameters = { value: req.query.value };
    req.instance.getDevice(null, parameters, rootUrl, queryPath,
                           function(response, status) {
      res.status(status).json(response);
    });
  }
  else {
    var status = responseHandler.NOTIMPLEMENTED;
    var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
    res.status(status).json(response);
  }
}


/**
 * Create a device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function createDevice(req, res) {
  var identifier = req.body.identifier;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.addDevice(identifier, url, rootUrl, queryPath,
                         function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve a specific device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevice(req, res) {
  var id = req.param('id');
  var parameters = {};
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.getDevice(id, parameters, rootUrl, queryPath,
                         function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Replace the specified device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceDevice(req, res) {
  var id = req.param('id');
  var identifier = req.body.identifier;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setDevice(id, identifier, url, rootUrl, queryPath,
                         function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteDevice(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeDevice(id, rootUrl, queryPath,
                            function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
