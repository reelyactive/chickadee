/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');
const responseHandler = require('./responsehandler');


let router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrieveAssociations(req, res);
  });

router.route('/:id/:type')
  .get(function(req, res) {
    retrieveAssociations(req, res);
  })
  .put(function(req, res) {
    replaceAssociation(req, res);
  })
  .delete(function(req, res) {
    removeAssociation(req, res);
  });

router.route('/:id/:type/url')
  .get(function(req, res) {
    retrieveAssociationProperty('url', req, res);
  })
  .put(function(req, res) {
    replaceAssociationProperty('url', req, res);
  })
  .delete(function(req, res) {
    removeAssociationProperty('url', req, res);
  });

router.route('/:id/:type/tags')
  .get(function(req, res) {
    retrieveAssociationProperty('tags', req, res);
  })
  .put(function(req, res) {
    replaceAssociationProperty('tags', req, res);
  })
  .delete(function(req, res) {
    removeAssociationProperty('tags', req, res);
  });

router.route('/:id/:type/directory')
  .get(function(req, res) {
    retrieveAssociationProperty('directory', req, res);
  })
  .put(function(req, res) {
    replaceAssociationProperty('directory', req, res);
  })
  .delete(function(req, res) {
    removeAssociationProperty('directory', req, res);
  });

router.route('/:id/:type/position')
  .get(function(req, res) {
    retrieveAssociationProperty('position', req, res);
  })
  .put(function(req, res) {
    replaceAssociationProperty('position', req, res);
  })
  .delete(function(req, res) {
    removeAssociationProperty('position', req, res);
  });


/**
 * Retrieve the given association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociations(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/chickadee/associations/index.html'));
      break;
    default:
      let id = req.params.id;
      let type = req.params.type;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      let associations = req.chickadee.associations;
      associations.retrieve(id, type, null, function(status, data) {
        let response = responseHandler.prepareResponse(req, status, data);
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

  let id = req.params.id;
  let type = req.params.type;
  let url = req.body.url;
  let directory = req.body.directory;
  let tags = req.body.tags;
  let position = req.body.position;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let associations = req.chickadee.associations;
  associations.replace(id, type, url, directory, tags, position,
                       function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
    res.status(status).json(response);
  });
}


/**
 * Remove the specified association.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function removeAssociation(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  let id = req.params.id;
  let type = req.params.type;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let associations = req.chickadee.associations;
  associations.remove(id, type, null, function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
    res.status(status).json(response);
  });
}


/**
 * Retrieve the given association property.
 * @param {String} property The name of the association property to retrieve.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveAssociationProperty(property, req, res) {
  if(redirect(req.params.id, '../', '/' + property, res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      // TODO: support HTML in future?
    default:
      let id = req.params.id;
      let type = req.params.type;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      let associations = req.chickadee.associations;
      associations.retrieve(id, type, property, function(status, data) {
        let response = responseHandler.prepareResponse(req, status, data);
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Replace the specified association property.
 * @param {String} property The name of the association property to replace.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceAssociationProperty(property, req, res) {
  if(redirect(req.params.id, '../', '/' + property, res)) {
    return;
  }

  let id = req.params.id;
  let type = req.params.type;
  let url, directory, tags, position = null;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let associations = req.chickadee.associations;

  if(property === 'url') { url = req.body.url; }
  if(property === 'directory') { directory = req.body.directory; }
  if(property === 'tags') { tags = req.body.tags; }
  if(property === 'position') { position = req.body.position; }

  associations.replace(id, type, url, directory, tags, position,
                       function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
    res.status(status).json(response);
  });
}


/**
 * Remove the specified association property.
 * @param {String} property The name of the association property to remove.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function removeAssociationProperty(property, req, res) {
  if(redirect(req.params.id, '../', '/' + property, res)) {
    return;
  }

  let id = req.params.id;
  let type = req.params.type;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let associations = req.chickadee.associations;
  associations.remove(id, type, property, function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
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
  let standardisedId = null;  // TODO: convert to standardised ID

  if(standardisedId && (standardisedId !== id)) {
    res.redirect(prefix + standardisedId + suffix);
    return true;
  }

  return false;
}


module.exports = router;
