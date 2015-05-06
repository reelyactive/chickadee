/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var responseHandler = require('../responsehandler');


var router = express.Router();


router.route('/:tag')
  .get(function(req, res) {
    retrieveContextNear(req, res);
  });


/**
 * Retrieve the context near a given tag/id.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContextNear(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = { query: 'decodedBySame',
                      ids: [ req.param('tag') ], // TODO: check if id or tag!
                      omit: [ 'timestamp', 'radioDecodings' ] };
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
