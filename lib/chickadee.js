/**
 * Copyright reelyActive 2015-2026
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
    let chimps = options.chimps;
    let io = options.io;
    let associationsDatabase = new DatabaseManager(
         { databaseName: "associations", onReady: associationsDatabaseReady });
    let featuresDatabase = new DatabaseManager(
                 { databaseName: "features", onReady: featuresDatabaseReady });
    this.associations = new AssociationsManager(options, chimps,
                                                associationsDatabase);
    this.context = new ContextManager(options, barnacles, chimps,
                                      associationsDatabase);
    this.features = new FeaturesManager(options, chimps, featuresDatabase);
    this.socket = new SocketManager(options, io, barnacles, chimps,
                                    this.context);

    function associationsDatabaseReady(err, db) {
      self.associations.init();
    }
    function featuresDatabaseReady(err, db) {
      self.features.init();
    }

    console.log('reelyActive Chickadee instance is curious to associate metadata in an open IoT');
  }

  /**
   * Watch the associations, passing them via the provided callback on change.
   * @param {callback} callback The function to call when associations change.
   * @param {Object} options The optional options.
   */
  watchAssociations(callback, options) {
    this.associations.watch(callback, options);
  }

  /**
   * Watch the features, passing them via the provided callback on change.
   * @param {callback} callback The function to call when features change.
   * @param {Object} options The optional options.
   */
  watchFeatures(callback, options) {
    this.features.watch(callback, options);
  }

}


/**
 * Configure the routes of the API.
 * @param {Express} app The Express app.
 * @param {Chickadee} instance The Chickadee instance.
 */
function configureExpress(app, instance) {
  app.use((req, res, next) => {
    req.chickadee = instance;
    next();
  });
  app.use(express.json());
  app.use('/associations', require('./routes/associations'));
  app.use('/context', require('./routes/context'));
  app.use('/features', require('./routes/features'));
  app.use('/', express.static(path.resolve(__dirname + '/../web')));
}


module.exports = Chickadee;
