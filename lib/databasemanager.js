/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


const nedb = require('nedb');


const DEFAULT_DATA_FOLDER = 'data';
const DEFAULT_ASSOCIATION_DB = 'associations.db';


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

    let filename = DEFAULT_DATA_FOLDER + '/' + DEFAULT_ASSOCIATION_DB;
    this.db = new nedb({ filename: filename, autoload: true });
  }
}


module.exports = DatabaseManager;
