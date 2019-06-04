/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


const express = require('express');
const path = require('path');
const AssociationManager = require('./associationmanager');
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
    this.associationManager = new AssociationManager(options, this.database);

    console.log('reelyActive Chickadee instance is curious to associate metadata in an open IoT');
  }

  /**
   * Get an existing association.
   * @param {Object} req The request which originated this function call.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to get.
   * @param {String} rootUrl The root URL of the original query.
   * @param {String} queryPath The query path of the original query.
   * @param {callback} callback Function to call on completion.
   */
  getAssociation(req, id, type, property, rootUrl, queryPath, callback) {
    let status = 200;
    let response = { id: id, type: type };
    callback(response, status);
  }

  /**
   * Update an existing association.
   * @param {Object} req The request which originated this function call.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} url The URL associated with the device.
   * @param {String} directory The directory associated with the device.
   * @param {Array} tags The tags associated with the device.
   * @param {Array} position The position associated with the device.
   * @param {String} rootUrl The root URL of the original query.
   * @param {String} queryPath The query path of the original query.
   * @param {callback} callback Function to call on completion.
   */
  setAssociation(req, id, type, url, directory, tags, position, rootUrl,
                 queryPath, callback) {
    let status = 200;
    let response = {};
    callback(response, status);
  }

  /**
   * Remove an existing association.
   * @param {Object} req The request which originated this function call.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to remove.
   * @param {String} rootUrl The root URL of the original query.
   * @param {String} queryPath The query path of the original query.
   * @param {callback} callback Function to call on completion.
   */
  removeAssociation(req, id, type, property, rootUrl, queryPath, callback) {
    let status = 200;
    let response = {};
    callback(response, status);
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
