/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var responseHandler = require('../responsehandler');


var router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrievePlaces(req, res);
  })
  .post(function(req, res) {
    createPlace(req, res);
  });


router.route('/:place')
  .get(function(req, res) {
    retrievePlace(req, res);
  })
  .put(function(req, res) {
    replacePlace(req, res);
  })
  .delete(function(req, res) {
    deletePlace(req, res);
  });


router.route('/:place/devices/:id')
  .get(function(req, res) {
    retrievePlaceDevice(req, res);
  })
  .put(function(req, res) {
    replacePlaceDevice(req, res);
  })
  .delete(function(req, res) {
    deletePlaceDevice(req, res);
  });


/**
 * Retrieve all places.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlaces(req, res) {
  var status = responseHandler.NOTIMPLEMENTED;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
  res.status(status).json(response);
}


/**
 * Create a place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function createPlace(req, res) {
  var name = req.body.name;
  var devices = req.body.devices;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.addPlace(name, devices, url, rootUrl, queryPath,
                        function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve a specific place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlace(req, res) {
  var name = req.param('place');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.getPlace(name, rootUrl, queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Replace the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replacePlace(req, res) {
  var name = req.param('place');
  var devices = req.body.devices;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setPlace(name, devices, url, rootUrl, queryPath,
                        function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deletePlace(req, res) {
  var name = req.param('place');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removePlace(name, rootUrl, queryPath,
                           function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve the specified device associated with the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlaceDevice(req, res) {
  var status = responseHandler.NOTIMPLEMENTED;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
  res.status(status).json(response);
}


/**
 * Replace the specified device of the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replacePlaceDevice(req, res) {
  var name = req.param('place');
  var id = req.param('id');
  var device = req.body.device;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setPlaceDevice(name, id, device, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified device of the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deletePlaceDevice(req, res) {
  var name = req.param('place');
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removePlaceDevice(name, id, rootUrl, queryPath,
                                 function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
