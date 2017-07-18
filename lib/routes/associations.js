/**
 * Copyright reelyActive 2015-2017
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var reelib = require('reelib');


var router = express.Router();

router.route('')
  .get(function(req, res) {
    retrieveAssociations(req, res);
  });


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

router.route('/:id/position')
  .get(function(req, res) {
    retrieveAssociationPosition(req, res);
  })
  .put(function(req, res) {
    replaceAssociationPosition(req, res);
  })
  .delete(function(req, res) {
    deleteAssociationPosition(req, res);
  });


/**
 * Retrieve all available associations.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociations(req, res) {
  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociations(req, rootUrl, queryPath,
                                    function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Retrieve the given association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociation(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.params.id;
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, null, rootUrl, queryPath,
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
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  var id = req.params.id;
  var url = req.body.url;
  var directory = req.body.directory;
  var tags = req.body.tags;
  var position = req.body.position;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, url, directory, tags, position,
                               rootUrl, queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociation(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  var id = req.params.id;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, null, rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/url', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.params.id;
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, 'url', rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/url', res)) {
    return;
  }

  var id = req.params.id;
  var url = req.body.url;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, url, null, null, null, rootUrl,
                                queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association url.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationUrl(req, res) {
  if(redirect(req.params.id, '../', '/url', res)) {
    return;
  }

  var id = req.param('id');
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, 'url', rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/directory', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.params.id;
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, 'directory', rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/directory', res)) {
    return;
  }

  var id = req.params.id;
  var directory = req.body.directory;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, null, directory, null, null, rootUrl,
                               queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association directory.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationDirectory(req, res) {
  if(redirect(req.params.id, '../', '/directory', res)) {
    return;
  }

  var id = req.params.id;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, 'directory', rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.params.id;
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, 'tags', rootUrl, queryPath,
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
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  var id = req.params.id;
  var tags = req.body.tags;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, null, null, tags, null, rootUrl,
                                queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association tag.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationTags(req, res) {
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  var id = req.params.id;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, 'tags', rootUrl, queryPath,
                                  function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Retrieve the given association position.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationPosition(req, res) {
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    // TODO: support HTML in future
    //case 'html':
    //  res.sendFile(path.resolve(__dirname + '/../../web/association.html'));
    //  break;
    default:
      var id = req.params.id;
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, 'position', rootUrl, queryPath,
                                   function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association position.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociationPosition(req, res) {
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  var id = req.params.id;
  var position = req.body.position;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, null, null, null, position, rootUrl,
                                queryPath, function(response, status) {
    res.status(status).json(response);
  });
}


/**
 * Delete the specified association position.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function deleteAssociationPosition(req, res) {
  if(redirect(req.params.id, '../', '/tags', res)) {
    return;
  }

  var id = req.params.id;
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, 'position', rootUrl, queryPath,
                                  function(response, status) {
    res.status(status).json(response);
  });
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
