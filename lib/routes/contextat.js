/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var responseHandler = require('../responsehandler');


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
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = { query: 'receivedBy',
                      id: req.param('id'),
                      omit: [ 'timestamp' ] }; 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getDevicesContext(options, rootUrl, queryPath,
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
      var options = { query: 'receivedBy',
                      directory: req.param('directory'),
                      omit: [ 'timestamp' ] }; 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getDevicesContext(options, rootUrl, queryPath,
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
      var options = { query: 'receivedBy',
                      tags: req.param('tags'),
                      omit: [ 'timestamp' ] }; 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getDevicesContext(options, rootUrl, queryPath,
                                     function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


module.exports = router;
