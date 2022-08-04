/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


const express = require('express');
const path = require('path');
const AssociationsManager = require('./associationsmanager');
const ContextManager = require('./contextmanager');
const DatabaseManager = require('./databasemanager');
const FeaturesManager = require('./featuresmanager');
const SocketManager = require('./socketmanager');


/**
 * Chickadee Class
 * Associates wireless identifiers with metadata.
 */
class Chickadee {

  /**
   * Chickadee constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    if(options.app) {
      configureExpress(options.app, self);
    }

    let barnacles = options.barnacles;
    let io = options.io;
    let associationsDatabase = new DatabaseManager(
                                              { databaseName: "associations" });
    let featuresDatabase = new DatabaseManager({ databaseName: "features" });
    this.associations = new AssociationsManager(options, associationsDatabase);
    this.context = new ContextManager(options, barnacles, associationsDatabase);
    this.features = new FeaturesManager(options, featuresDatabase);
    this.socket = new SocketManager(options, io, barnacles, this.context);

    console.log('reelyActive Chickadee instance is curious to associate metadata in an open IoT');
  }

}


/**
 * Configure the routes of the API.
 * @param {Express} app The Express app.
 * @param {Chickadee} instance The Chickadee instance.
 */
function configureExpress(app, instance) {
  app.use(function(req, res, next) {
    req.chickadee = instance;
    next();
  });
  app.use('/associations', require('./routes/associations'));
  app.use('/context', require('./routes/context'));
  app.use('/features', require('./routes/features'));
  app.use('/', express.static(path.resolve(__dirname + '/../web')));
}


module.exports = Chickadee;
