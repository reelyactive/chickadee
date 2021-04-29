/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const SIGNATURE_SEPARATOR = '/';


/**
 * ContextManager Class
 * Manages the context of ambient data.
 */
class ContextManager {

  /**
   * ContextManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Barnacles} barnacles The barnacles instance.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, barnacles, database) {
    options = options || {};

    this.barnacles = barnacles;
    this.database = database;
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
    let self = this;

    if(!this.barnacles) {
      return callback(400);
    }

    let signatures = null;

    if(id) {
      let signature = id;

      if(type) {
        signature += SIGNATURE_SEPARATOR + type;
      }
      signatures = [ signature ];
    }

    if(directory) {
      lookupDevicesByDirectory(directory, self.database, function(signatures) {
        retrieveContext(signatures, self.barnacles, self.database, callback);
      });
    }
    else if(tag) {
      lookupDevicesByTag(tag, self.database, function(signatures) {
        retrieveContext(signatures, self.barnacles, self.database, callback);
      });
    }
    else {
      retrieveContext(signatures, self.barnacles, self.database, callback);
    }
  }

}


/**
 * Retrieve the context of the given devices from the barnacles instance.
 * @param {Array} signatures The deviceId signatures to query.
 * @param {Barnacles} barnaces The barnacles instance from which to retrieve.
 * @param {DatabaseManager} database The database to query associations.
 * @param {callback} callback The function to call on completion.
 */
function retrieveContext(signatures, barnacles, database, callback) {
  barnacles.retrieveContext(signatures, null, function(devices) {
    if(devices) {
      appendDeviceAssociations(devices, database, function(devices) {
        if(devices) {
          return callback(200, { devices: devices });
        }

        return callback(400);
      });
    }
    else {
      return callback(404);
    }
  });
}


/**
 * Query the database and append any associations to the given devices.
 * @param {Object} devices The devices with which to associate.
 * @param {DatabaseManager} database The database to query associations.
 * @param {callback} callback The function to call on completion.
 */
function appendDeviceAssociations(devices, database, callback) {
  let deviceIds = Object.keys(devices);
  let query = { _id: { "$in": deviceIds } };

  database.find(query, {}, function(err, associations) {
    if(err) {
      return callback(null);
    }

    associations.forEach(function(association) {
      let device = devices[association._id];
      for(const property in association) {
        if(property !== '_id') {
          device[property] = association[property];
        }
      }
    });

    return callback(devices);
  });
}


/**
 * Query the database for the devices associated with the given directory.
 * @param {String} directory The directory to look up.
 * @param {DatabaseManager} database The database to query associations.
 * @param {callback} callback The function to call on completion.
 */
function lookupDevicesByDirectory(directory, database, callback) {
  let startsWithDirectory = new RegExp('^(' + directory + ')', 'i');
  let query = { directory: startsWithDirectory };

  database.find(query, { _id: 1 }, function(err, associations) {
    if(err) {
      return callback(null);
    }

    let signatures = [];

    associations.forEach(function(association) {
      signatures.push(association._id);
    });

    return callback(signatures);
  });
}


/**
 * Query the database for the devices associated with the given tag.
 * @param {String} tag The tag to look up.
 * @param {DatabaseManager} database The database to query associations.
 * @param {callback} callback The function to call on completion.
 */
function lookupDevicesByTag(tag, database, callback) {
  let query = { tags: tag };

  database.find(query, { _id: 1 }, function(err, associations) {
    if(err) {
      return callback(null);
    }

    let signatures = [];

    associations.forEach(function(association) {
      signatures.push(association._id);
    });

    return callback(signatures);
  });
}


module.exports = ContextManager;
