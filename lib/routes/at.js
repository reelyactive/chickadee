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
  var place = req.body.place;
  var identifiers = req.body.identifiers;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.addPlace(place, identifiers, rootUrl, queryPath,
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
  var place = req.param('place');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.getPlace(place, rootUrl, queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Replace the specified place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replacePlace(req, res) {
  var place = req.param('place');
  var identifiers = req.body.identifiers;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setPlace(place, identifiers, rootUrl, queryPath,
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
  var place = req.param('place');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removePlace(place, rootUrl, queryPath,
                           function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
