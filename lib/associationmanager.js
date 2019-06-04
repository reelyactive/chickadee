/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


/**
 * AssociationManager Class
 * Manages the association of wireless identifiers with metadata.
 */
class AssociationManager {

  /**
   * AssociationManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, database) {
    options = options || {};

    this.database = database;
  }

  /**
   * Retrieve an existing association.
   * @param {Object} req The request which originated this function call.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to get.
   * @param {String} rootUrl The root URL of the original query.
   * @param {String} queryPath The query path of the original query.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(req, id, type, property, rootUrl, queryPath, callback) {
    let status = 200;
    let response = { id: id, type: type };
    callback(response, status);
  }

  /**
   * Create/replace an association.
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
  replace(req, id, type, url, directory, tags, position, rootUrl, queryPath,
          callback) {
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
  remove(req, id, type, property, rootUrl, queryPath, callback) {
    let status = 200;
    let response = {};
    callback(response, status);
  }
}


module.exports = AssociationManager;
