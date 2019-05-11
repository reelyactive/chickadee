/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');


let router = express.Router();

router.route('/:id/:type')
  .get(function(req, res) {
    retrieveAssociation(req, res);
  })
  .put(function(req, res) {
    replaceAssociation(req, res);
  })
  .delete(function(req, res) {
    deleteAssociation(req, res);
  });


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
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/chickadee/associations/index.html'));
      break;
    default:
      let id = req.params.id;
      let type = req.params.type;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      req.chickadee.getAssociation(req, id, type, null, rootUrl, queryPath,
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

  let id = req.params.id;
  let type = req.params.type;
  let url = req.body.url;
  let directory = req.body.directory;
  let tags = req.body.tags;
  let position = req.body.position;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  req.chickadee.setAssociation(req, id, type, url, directory, tags, position,
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

  let id = req.params.id;
  let type = req.params.type;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  req.chickadee.removeAssociation(req, id, type, null, rootUrl, queryPath,
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
  let standardisedId = null;  // TODO: convert to standardised ID

  if(standardisedId && (standardisedId !== id)) {
    res.redirect(prefix + standardisedId + suffix);
    return true;
  }

  return false;
}


module.exports = router;
