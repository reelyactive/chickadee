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
  });


router.route('/:id/association')
  .get(function(req, res) {
    retrieveDeviceAssociation(req, res);
  })
  .put(function(req, res) {
    replaceDeviceAssociation(req, res);
  })
  .delete(function(req, res) {
    deleteDeviceAssociation(req, res);
  });


/**
 * Retrieve all devices.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevices(req, res) {
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var status = responseHandler.NOTIMPLEMENTED;
  var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
  res.status(status).json(response);
}


/**
 * Retrieve a specific device association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDeviceAssociation(req, res) {
  var id = req.param('id');
  var parameters = {};
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.getDeviceAssociation(id, parameters, rootUrl, queryPath,
                                    function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Replace the specified device association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceDeviceAssociation(req, res) {
  var id = req.param('id');
  var identifiers = req.body.identifiers;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setDeviceAssociation(id, identifiers, url, rootUrl, queryPath,
                                    function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified device association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteDeviceAssociation(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeDeviceAssociation(id, rootUrl, queryPath,
                            function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
