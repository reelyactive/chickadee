/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var reelib = require('reelib');


var router = express.Router();


router.route('/receiver/:id')
  .get(function(req, res) {
    retrieveContextAtReceiver(req, res);
  });


router.route('/directory/:directory')
  .get(function(req, res) {
    retrieveContextAtDirectory(req, res);
  });


router.route('/tags/:tags')
  .get(function(req, res) {
    retrieveContextAtTags(req, res);
  });


/**
 * Retrieve the context at a given receiver device id.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextAtReceiver(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedStrongestBy',
        id: req.params.id,
        omit: [ 'timestamp' ] }; 
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
 * Retrieve the context at a given directory value.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextAtDirectory(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedStrongestBy',
        directory: req.params.directory,
        omit: [ 'timestamp' ] }; 
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
 * Retrieve the context at the given tag(s).
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextAtTags(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedStrongestBy',
        tags: req.params.tags,
        omit: [ 'timestamp' ] }; 
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

  if(validatedID && (validatedID !== id)) {
    res.redirect(prefix + validatedID + suffix);
    return true;
  }

  return false;
}

module.exports = router;
