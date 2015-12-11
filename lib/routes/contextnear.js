/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var reelib = require('reelib');


var router = express.Router();


router.route('/transmitter/:id')
  .get(function(req, res) {
    retrieveContextNearTransmitter(req, res);
  });


router.route('/tags/:tags')
  .get(function(req, res) {
    retrieveContextNearTags(req, res);
  });


/**
 * Retrieve the context near the given transmitter device id.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextNearTransmitter(req, res) {
  if (redirect(req.param('id'), '', '', res)) {
    return;
  }

  switch (req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedBySame',
        id: req.param('id'),
        omit: ['timestamp']
      };
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getDevicesContext(req, options, rootUrl, queryPath,
        function(response, status) {
          res.status(status).json(response);
        });
      break;
  }
}


/**
 * Retrieve the context near the given tag(s).
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextNearTags(req, res) {
  switch (req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedBySame',
        tags: req.param('tags'),
        omit: ['timestamp']
      };
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getDevicesContext(req, options, rootUrl, queryPath,
        function(response, status) {
          res.status(status).json(response);
        });
      break;
  }
}


/**
 * Redirect if required and return the status.
 * @param {String} id The given ID.
 * @param {String} prefix The prefix to the ID in the path.
 * @param {String} suffix The suffix to the ID in the path.
 * @param {Object} res The HTTP result.
 * @return {boolean} Redirection performed?
 */
function redirect(id, prefix, suffix, res) {
  var validatedID = reelib.identifier.toIdentifierString(id);

  if (validatedID && (validatedID !== id)) {
    res.redirect(prefix + validatedID + suffix);
    return true;
  }

  return false;
}

module.exports = router;
