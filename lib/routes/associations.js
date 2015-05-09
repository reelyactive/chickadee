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


router.route('/:id/directory')
  .get(function(req, res) {
    retrieveAssociationDirectory(req, res);
  })
  .put(function(req, res) {
    replaceAssociationDirectory(req, res);
  })
  .delete(function(req, res) {
    deleteAssociationDirectory(req, res);
  });


router.route('/:id/tags')
  .get(function(req, res) {
    retrieveAssociationTags(req, res);
  })
  .put(function(req, res) {
    replaceAssociationTags(req, res);
  })
  .delete(function(req, res) {
    deleteAssociationTags(req, res);
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
  var directory = req.body.directory;
  var tags = req.body.tags;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, url, directory, tags, rootUrl, queryPath,
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
  req.instance.setAssociation(id, url, null, null, rootUrl, queryPath,
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
 * Retrieve the given association directory.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationDirectory(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.param('id'); 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getAssociation(id, 'directory', rootUrl, queryPath,
                                  function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association directory.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociationDirectory(req, res) {
  var id = req.param('id');
  var directory = req.body.directory;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, null, directory, null, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association directory.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationDirectory(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeAssociation(id, 'directory', rootUrl, queryPath,
                                    function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve the given association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationTags(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.param('id'); 
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getAssociation(id, 'tags', rootUrl, queryPath,
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
function replaceAssociationTags(req, res) {
  var id = req.param('id');
  var tags = req.body.tags;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.setAssociation(id, null, null, tags, rootUrl, queryPath,
                              function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationTags(req, res) {
  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.instance.removeAssociation(id, 'tags', rootUrl, queryPath,
                                 function(response, status) {
    res.status(status).json(response);
  });
}


module.exports = router;
