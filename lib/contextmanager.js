/**
 * Copyright reelyActive 2015-2025
 * We believe in an open Internet of Things
 */


const SIGNATURE_SEPARATOR = '/';
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;


/**
 * ContextManager Class
 * Manages the context of ambient data.
 */
class ContextManager {

  /**
   * ContextManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Barnacles} barnacles The barnacles instance.
   * @param {Chimps} chimps The chimps instance.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, barnacles, chimps, database) {
    options = options || {};

    this.barnacles = barnacles;
    this.chimps = chimps;
    this.database = database;
  }

  /**
   * Retrieve context.
   * @param {String} id The (optional) id of the queried device.
   * @param {String} type The (optional) type of id of the queried device.
   * @param {String} directory The (optional) directory to query.
   * @param {String} tag The (optional) tag to query.
   * @param {Object} queryParameters The query string parameters, if any.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, directory, tag, queryParameters, callback) {
    let self = this;

    if(!this.barnacles) {
      return callback(HTTP_STATUS_BAD_REQUEST);
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
        if(Array.isArray(signatures) && (signatures.length > 0)) {
          retrieveContext(signatures, self.barnacles, self.chimps,
                          self.database, queryParameters, callback);
        }
        else if(Array.isArray(signatures) && (signatures.length === 0)) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }
        else {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
      });
    }
    else if(tag) {
      lookupDevicesByTag(tag, self.database, function(signatures) {
        if(Array.isArray(signatures) && (signatures.length > 0)) {
          retrieveContext(signatures, self.barnacles, self.chimps,
                          self.database, queryParameters, callback);
        }
        else if(Array.isArray(signatures) && (signatures.length === 0)) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }
        else {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
      });
    }
    else {
      retrieveContext(signatures, self.barnacles, self.chimps, self.database,
                      queryParameters, callback);
    }
  }

}


/**
 * Retrieve the context of the given devices from the barnacles instance.
 * @param {Array} signatures The deviceId signatures to query.
 * @param {Barnacles} barnacles The barnacles instance from which to retrieve.
 * @param {Chimps} chimps The chimps instance from which to retrieve.
 * @param {DatabaseManager} database The database to query associations.
 * @param {Object} queryParameters The query string parameters, if any.
 * @param {callback} callback The function to call on completion.
 */
function retrieveContext(signatures, barnacles, chimps, database,
                         queryParameters, callback) {
  barnacles.retrieveContext(signatures, null, function(devices) {
    if(devices) {
      if(chimps) {
        chimps.retrieveContext(signatures, function(complementaryDevices) {
          if(complementaryDevices) {
            for(const signature in devices) {
              if(complementaryDevices.hasOwnProperty(signature)) {
                Object.assign(devices[signature],
                              complementaryDevices[signature]);
              }
            }
          }
          appendDeviceAssociations(devices, database, function(devices) {
            if(devices) {
              let trimmedDevices = trim(devices, queryParameters?.include);
              return callback(HTTP_STATUS_OK, { devices: trimmedDevices });
            }

            return callback(HTTP_STATUS_BAD_REQUEST);
          });
        });
      }
      else {
        appendDeviceAssociations(devices, database, function(devices) {
          if(devices) {
            let trimmedDevices = trim(devices, queryParameters?.include);
            return callback(HTTP_STATUS_OK, { devices: trimmedDevices });
          }

          return callback(HTTP_STATUS_BAD_REQUEST);
        });
      }
    }
    else {
      return callback(HTTP_STATUS_NOT_FOUND);
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
  // TODO: apply specific query once supported by ESMapDB
  //let deviceIds = Object.keys(devices);
  let query = {}; // { _id: { "$in": deviceIds } };

  database.find(query, function(err, associations) {
    if(err) {
      return callback(null);
    }

    for(const deviceSignature in devices) {
      if(associations.has(deviceSignature)) {
        let association = associations.get(deviceSignature);
        for(const property in association) {
          devices[deviceSignature][property] = association[property];
        }
      }
    }

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
  //let startsWithDirectory = new RegExp('^(' + directory + ')', 'i');
  let query = {}; // { directory: startsWithDirectory };

  database.find(query, function(err, associations) {
    if(err) {
      return callback(null);
    }

    let signatures = [];

    associations.forEach(function(association, deviceSignature) {
      if(association.hasOwnProperty('directory') &&
         ((association.directory === directory) ||
          (association.directory.startsWith(directory) &&
           (association.directory.charAt(directory.length) === ':')))) {
        signatures.push(deviceSignature);
      }
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
  // TODO: apply specific query once supported by ESMapDB
  let query = {}; // { tags: tag };

  database.find(query, function(err, associations) {
    if(err) {
      return callback(null);
    }

    let signatures = [];

    associations.forEach(function(association, deviceSignature) {
      if(association.hasOwnProperty('tags') &&
         Array.isArray(association.tags) && association.tags.includes(tag)) {
        signatures.push(deviceSignature);
      }
    });

    return callback(signatures);
  });
}


/**
 * Trim the given devices to include only the given properties.
 * @param {Object} devices The devices.
 * @param {Object} properties The properties to include, if any.
 */
function trim(devices, properties) {
  if(!properties) {
    return devices; // Nothing to trim
  }

  if(!Array.isArray(properties)) {
    properties = [ properties ];
  }

  let trimmedDevices = {};

  for(const deviceSignature in devices) {
    let device = devices[deviceSignature];
    trimmedDevices[deviceSignature] = {};

    properties.forEach((property) => {
      if(device.hasOwnProperty(property)) {
        trimmedDevices[deviceSignature][property] = device[property];
      }
    });
  }

  return trimmedDevices;
}


module.exports = ContextManager;
