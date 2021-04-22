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
   * @param {String} id The id of the device association.
   * @param {String} type The type of id of the device association.
   * @param {String} property A specific association property to get.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, callback) {
    let isSpecificAssociation = (id && type);
    let query = {};
    let projection = {};

    if(isSpecificAssociation) {
      let identifier = id + '/' + type;
      query = { _id: identifier };

      if(property) {
        projection[property] = 1;
      }
    }
    else {
      projection = { url: 0, directory: 0, tags: 0, position: 0 };
    }

    this.database.find(query, projection, function(err, associations) {
      if(err) {
        return callback(400);
      }
      else if(associations.length === 0) {
        return callback(404);
      }
      else {
        return callback(200, { associations: associations });
      }
    });
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
    let identifier = id + '/' + type;
    let association = prepareAssociation(url, directory, tags, position);
    let query = { _id: identifier };
    let update = { $set: association };
    let options = { upsert: true };

    this.database.update(query, update, options,
                         function(err, numReplaced, associations, upsert) {
      if(err) {
        return callback(400);
      }
      else if(upsert === true) {
        return callback(201, { associations: associations });
      }
      else {
        return callback(200, { associations: associations });
      }
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
    let identifier = id + '/' + type;
    let query = { _id: identifier };

    // Delete only a single property
    if(property) {
      let unset = {};

      if(property === 'url') { unset = { url: true }; }
      else if(property === 'directory') { unset = { directory: true }; }
      else if(property === 'tags') { unset = { tags: true }; }
      else if(property === 'position') { unset = { position: true }; }

      let update = { $unset: unset };

      this.database.update(query, update, {}, function(err, numReplaced) {
        if(err) {
          return callback(400);
        }
        else if(numReplaced === 0) {
          return callback(404);
        }
        else {
          return callback(200);
        }
      });
    }

    // Delete the entire association
    else {
      this.database.remove(query, function(err, numRemoved) {
        if(err) {
          return callback(400);
        }
        else if(numRemoved === 0) {
          return callback(404);
        }
        else {
          return callback(200);
        }
      });
    }
  }

}


/**
 * Prepare the association object, validating the given parameters.
 * @param {String} url The URL associated with the device.
 * @param {String} directory The directory associated with the device.
 * @param {Array} tags The tags associated with the device.
 * @param {Array} position The position associated with the device.
 */
function prepareAssociation(url, directory, tags, position) {
  let association = {};

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

  return association;
}


module.exports = AssociationManager;
