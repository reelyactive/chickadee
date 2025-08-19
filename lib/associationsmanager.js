/**
 * Copyright reelyActive 2015-2024
 * We believe in an open Internet of Things
 */


const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;


/**
 * AssociationsManager Class
 * Manages the association of wireless identifiers with metadata.
 */
class AssociationsManager {

  /**
   * AssociationsManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Chimps} chimps The chimps instance.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, chimps, database) {
    let self = this;
    options = options || {};

    this.database = database;
    this.chimps = chimps;

    setTimeout(updateChimps, 1000, self); // TODO: better handle database load
  }

  /**
   * Retrieve an existing association.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to get.
   * @param {Object} queryParameters The query string parameters, if any.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, queryParameters, callback) {
    let isSpecificAssociation = (id && type);

    if(isSpecificAssociation) {
      let key = id + '/' + type;

      this.database.get(key, (err, association) => {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else if(association === undefined) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }
        else if(property) {
          let data = { associations: {} };
          data.associations[key] = {};
          data.associations[key][property] = association[property];
          return callback(HTTP_STATUS_OK, data);
        }
        else {
          let data = { associations: {} };
          data.associations[key] = association;
          return callback(HTTP_STATUS_OK, data);
        }
      });
    }
    else {
      let query = {};

      this.database.find(query, (err, result) => {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else {
          let associations = {};
          for(let key of result.keys()) {
            let properties = filterByQuery(result.get(key), queryParameters);

            if(properties) {
              associations[key] = properties;
            }
          }
          return callback(HTTP_STATUS_OK, { associations: associations });
        }
      });
    }
  }

  /**
   * Create/replace an association.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} url The URL associated with the device.
   * @param {String} directory The directory associated with the device.
   * @param {Array} tags The tags associated with the device.
   * @param {Array} position The position associated with the device.
   * @param {callback} callback Function to call on completion.
   */
  replace(id, type, url, directory, tags, position, callback) {
    let self = this;
    let key = id + '/' + type;

    this.database.get(key, (err, association) => {
      if(err) {
        return callback(HTTP_STATUS_BAD_REQUEST);
      }

      let isPresent = (association !== undefined);
      association = association || {};

      if(url && (typeof url === 'string')) {
        association.url = url;
      }
      if(directory && (typeof directory === 'string')) {
        association.directory = directory;
      }
      if(tags && Array.isArray(tags)) {
        association.tags = tags;
      }
      if(position && Array.isArray(position)) {
        association.position = position;
      }

      self.database.set(key, association, (err) => {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else {
          let status = (isPresent ? HTTP_STATUS_OK : HTTP_STATUS_CREATED);
          let data = { associations: {} };
          data.associations[key] = association;

          updateChimps(self);
          return callback(status, data);
        }
      });
    });
  }

  /**
   * Remove an existing association.
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to remove.
   * @param {callback} callback Function to call on completion.
   */
  remove(id, type, property, callback) {
    let self = this;
    let key = id + '/' + type;

    // Delete only a single property
    if(property) {
      this.database.get(key, (err, association) => {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else if((association === undefined) ||
                !association.hasOwnProperty(property)) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }

        delete association[property];

        self.database.set(key, association, (err) => {
          if(err) {
            return callback(HTTP_STATUS_BAD_REQUEST);
          }
          else {
            let data = { associations: {} };
            data.associations[key] = association;
            updateChimps(self);
            return callback(HTTP_STATUS_OK, { associations: association });
          }
        });
      });
    }

    // Delete the entire association
    else {
      this.database.delete(key, (err, isRemoved) => {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else if(!isRemoved) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }
        else {
          updateChimps(self);
          return callback(HTTP_STATUS_OK);
        }
      });
    }
  }

}


/**
 * Filter the given association based on the given query parameters.
 * @param {Object} association The association properties.
 * @param {Object} queryParameters The query string parameters, if any.
 */
function filterByQuery(association, queryParameters) {
  let isQuery = (queryParameters != null) &&
                (typeof queryParameters === 'object') &&
                (Object.keys(queryParameters).length > 0);

  if(!isQuery) {
    return {}; // Return empty association in absence of include parameter(s)
  }

  let isOnlyInclude = queryParameters.hasOwnProperty('include') &&
                      (Object.keys(queryParameters).length === 1);

  // Accept association unconditionally, including queried properties
  if(isOnlyInclude) {
    return trim(association, queryParameters.include);
  }

  // Accept association if tag(s) match
  if(Array.isArray(association.tags)) {
    let isSingleTagMatch = (typeof queryParameters.tag === 'string') &&
                           association.tags.includes(queryParameters.tag);
    if(isSingleTagMatch) {
      return trim(association, queryParameters.include);
    }
    else if(Array.isArray(queryParameters.tag)) {
      for(tag of queryParameters.tag) {
        if(association.tags.includes(tag)) {
          return trim(association, queryParameters.include);
        }
      }
    }
  }

  // Accept association if directory/ies match
  if(typeof association.directory === 'string') {
    let isSingleDirectoryMatch =
             (typeof queryParameters.directory === 'string') &&
             isDirectoryMatch(association.directory, queryParameters.directory);
    if(isSingleDirectoryMatch) {
      return trim(association, queryParameters.include);
    }
    else if(Array.isArray(queryParameters.directory)) {
      for(directory of queryParameters.directory) {
        if(isDirectoryMatch(association.directory, directory)) {
          return trim(association, queryParameters.include);
        }
      }
    }
  }

  return null;
}


/**
 * Trim the given association to include only the given properties.
 * @param {String} directory The association directory.
 * @param {String} queryDirectory The query directory.
 */
function isDirectoryMatch(directory, queryDirectory) {
  return directory.startsWith(queryDirectory) &&
         ((directory.length === queryDirectory.length) ||
          ((directory.length > queryDirectory.length) &&
           (directory.charAt(queryDirectory.length) === ':')));
}


/**
 * Trim the given association to include only the given properties.
 * @param {Object} association The association properties.
 * @param {Object} properties The properties to include, if any.
 */
function trim(association, properties) {
  let trimmedAssociation = {};

  let isValidSingleProperty = (typeof properties === 'string') &&
                              association.hasOwnProperty(properties);

  if(isValidSingleProperty) {
    trimmedAssociation[properties] = association[properties];
    return trimmedAssociation;
  }

  if(Array.isArray(properties)) {
    if(properties.includes('url') && (typeof association.url === 'string')) {
      trimmedAssociation.url = association.url;
    }
    if(properties.includes('tags') && Array.isArray(association.tags)) {
      trimmedAssociation.tags = association.tags;
    }
    if(properties.includes('directory') &&
       (typeof association.directory === 'string')) {
      trimmedAssociation.directory = association.directory;
    }
    if(properties.includes('position') && Array.isArray(association.position)) {
      trimmedAssociation.position = association.position;
    }
  }

  return trimmedAssociation;
}


/**
 * Set chimps' associations.
 * @param {AssociationsManager} instance The AssociationsManager instance.
 */
function updateChimps(instance) {
  if(instance.chimps) {
    instance.database.find({}, (err, result) => {
      if(!err) {
        instance.chimps.setAssociations(result);
      }
    });
  }
}


module.exports = AssociationsManager;
