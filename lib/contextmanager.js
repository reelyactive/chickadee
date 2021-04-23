/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


/**
 * ContextManager Class
 * Manages the context of ambient data.
 */
class ContextManager {

  /**
   * ContextManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Barnacles} barnacles The barnacles instance.
   * @constructor
   */
  constructor(options, barnacles) {
    options = options || {};

    this.barnacles = barnacles;
  }

  /**
   * Retrieve context.
   * @param {String} id The (optional) id of the queried device.
   * @param {String} type The (optional) type of id of the queried device.
   * @param {String} directory The (optional) directory to query.
   * @param {String} tag The (optional) tag to query.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, directory, tag, callback) {
    if(!this.barnacles) {
      return callback(400);
    }

    this.barnacles.retrieveDevices(id, type, null, function(devices) {
      if(devices) {
        return callback(200, { devices: devices });
      }
      else {
        return callback(404);
      }
    });
  }

}


module.exports = ContextManager;
