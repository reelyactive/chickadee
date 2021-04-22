/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


const express = require('express');
const path = require('path');
const AssociationsManager = require('./associationsmanager');
const DatabaseManager = require('./databasemanager');


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

    this.database = new DatabaseManager(options);
    this.associations = new AssociationsManager(options, this.database);

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
  app.use('/', express.static(path.resolve(__dirname + '/../web')));
}


module.exports = Chickadee;
