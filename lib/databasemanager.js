/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


const NeDBManager = require('./nedbmanager');


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

    // TODO: in future support other databases
    this.database = new NeDBManager(options);
  }
}


module.exports = DatabaseManager;
