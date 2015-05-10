/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var responseHandler = require('../responsehandler');


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
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = { query: 'receivedBySame',
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
 * Retrieve the context near the given tag(s).
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextNearTags(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = { query: 'receivedBySame',
                      tags: req.param('id'),
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
