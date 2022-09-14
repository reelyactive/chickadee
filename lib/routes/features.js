/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');
const responseHandler = require('./responsehandler');


let router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrieveFeatures(req, res);
  })
  .post(function(req, res) {
    createFeature(req, res);
  });

router.route('/:id')
  .get(function(req, res) {
    retrieveFeatures(req, res);
  })
  .put(function(req, res) {
    replaceFeature(req, res);
  })
  .delete(function(req, res) {
    removeFeature(req, res);
  });


/**
 * Retrieve the given feature.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveFeatures(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/chickadee/features/index.html'));
      break;
    default:
      let id = req.params.id;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      let features = req.chickadee.features;
      features.retrieve(id, function(status, data) {
        let response = responseHandler.prepareResponse(req, status, data);
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Create the given feature.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function createFeature(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  let feature = req.body;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let features = req.chickadee.features;
  features.create(feature, function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
    res.status(status).json(response);
  });
}


/**
 * Replace the specified feature.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function replaceFeature(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  let id = req.params.id;
  let feature = req.body;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let features = req.chickadee.features;
  features.replace(id, feature, function(status, data) {
    let response = responseHandler.prepareResponse(req, status, data);
    res.status(status).json(response);
  });
}


/**
 * Remove the specified feature.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function removeFeature(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  let id = req.params.id;
  let rootUrl = req.protocol + '://' + req.get('host');
  let queryPath = req.originalUrl;
  let features = req.chickadee.features;
  features.remove(id, function(status, data) {
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
