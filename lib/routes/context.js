/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');
const responseHandler = require('./responsehandler');


let router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrieveContext(req, res);
  });

router.route('/device/:id')
  .get(function(req, res) {
    retrieveContext(req, res);
  });

router.route('/device/:id/:type')
  .get(function(req, res) {
    retrieveContext(req, res);
  });

router.route('/directory/:directory')
  .get(function(req, res) {
    retrieveContext(req, res);
  });

router.route('/tag/:tag')
  .get(function(req, res) {
    retrieveContext(req, res);
  });


/**
 * Retrieve the context.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveContext(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/chickadee/context/index.html'));
      break;
    default:
      let id = req.params.id;
      let type = req.params.type;
      let directory = req.params.directory;
      let tag = req.params.tag;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      let context = req.chickadee.context;
      context.retrieve(id, type, directory, tag, req.query,
                       function(status, data) {
        let response = responseHandler.prepareResponse(req, status, data);
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
  let standardisedId = null;  // TODO: convert to standardised ID

  if(standardisedId && (standardisedId !== id)) {
    res.redirect(prefix + standardisedId + suffix);
    return true;
  }

  return false;
}


module.exports = router;
