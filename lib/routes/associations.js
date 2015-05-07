/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var responseHandler = require('../responsehandler');


var router = express.Router();


router.route('/:id')
  .get(function(req, res) {
    retrieveAssociation(req, res);
  })
  .put(function(req, res) {
    replaceAssociation(req, res);
  })
  .delete(function(req, res) {
    deleteAssociation(req, res);
  });


router.route('/:id/url')
  .get(function(req, res) {
    retrieveAssociationUrl(req, res);
  })
  .put(function(req, res) {
    replaceAssociationUrl(req, res);
  })
  .delete(function(req, res) {
    deleteAssociationUrl(req, res);
  });


router.route('/:id/tag')
  .get(function(req, res) {
    retrieveAssociationTag(req, res);
  })
  .put(function(req, res) {
    replaceAssociationTag(req, res);
  })
  .delete(function(req, res) {
    deleteAssociationTag(req, res);
  });


/**
 * Retrieve the given association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociation(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.param('id'); 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getAssociation(id, null, rootUrl, queryPath,
                                  function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociation(req, res) {
  var id = req.param('id');
  var url = req.body.url;
  var tag = req.body.tag;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, url, tag, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociation(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeAssociation(id, null, rootUrl, queryPath,
                                 function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve the given association url.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationUrl(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.param('id'); 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getAssociation(id, 'url', rootUrl, queryPath,
                                  function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association url.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociationUrl(req, res) {
  var id = req.param('id');
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, url, null, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association url.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationUrl(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeAssociation(id, 'url', rootUrl, queryPath,
                                    function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve the given association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationTag(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.param('id'); 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getAssociation(id, 'tag', rootUrl, queryPath,
                                  function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociationTag(req, res) {
  var id = req.param('id');
  var tag = req.body.tag;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, null, tag, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationTag(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeAssociation(id, 'tag', rootUrl, queryPath,
                                 function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
