/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


const ESMapDBManager = require('./esmapdbmanager');


/**
 * DatabaseManager Class
 * Manages the database(s) in which the data is stored, abstracting away the
 * implementation details.
 */
class DatabaseManager {

  /**
   * DatabaseManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.database = new ESMapDBManager(options);
  }

  /**
   * Delete the pair associated with the given key from database.
   * @param {String} key The key to look up.
   * @param {function} callback Function to call on completion.
   */
  delete(key, callback) {
    this.database.delete(key, callback);
  }

  /**
   * Get the value associated with the given key from database.
   * @param {String} key The key to look up.
   * @param {function} callback Function to call on completion.
   */
  get(key, callback) {
    this.database.get(key, callback);
  }

  /**
   * Determine if the given key exists in the database.
   * @param {String} key The key to look up.
   * @param {function} callback Function to call on completion.
   */
  has(key, callback) {
    this.database.has(key, callback);
  }

  /**
   * Set the value associated with the given key in the database.
   * @param {String} key The key to look up.
   * @param {function} callback Function to call on completion.
   */
  set(key, value, callback) {
    this.database.set(key, value, callback);
  }

  /**
   * Find all key/value pairs in the database that match the given query.
   * @param {Object} query The query parameters.
   * @param {function} callback Function to call on completion.
   */
  find(query, callback) {
    this.database.find(query, callback);
  }

}


module.exports = DatabaseManager;
