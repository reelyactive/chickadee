/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


/**
 * AssociationsManager Class
 * Manages the association of wireless identifiers with metadata.
 */
class AssociationsManager {

  /**
   * AssociationsManager constructor
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

    if(isSpecificAssociation) {
      let key = id + '/' + type;

      this.database.get(key, function(err, association) {
        if(err) {
          return callback(400);
        }
        else if(association === undefined) {
          return callback(404);
        }
        else if(property) {
          let data = { associations: {} };
          data.associations[key] = {};
          data.associations[key][property] = association[property];
          return callback(200, data);
        }
        else {
          let data = { associations: {} };
          data.associations[key] = association;
          return callback(200, data);
        }
      });
    }
    else {
      let query = {};

      this.database.find(query, function(err, result) {
        if(err) {
          return callback(400);
        }
        else {
          let associations = {};
          for(let key of result.keys()) {
            associations[key] = {};
          }
          return callback(200, { associations: associations });
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

    this.database.get(key, function(err, association) {
      if(err) {
        return callback(400);
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

      self.database.set(key, association, function(err) {
        if(err) {
          return callback(400);
        }
        else {
          let status = (isPresent ? 200 : 201);
          let data = { associations: {} };
          data.associations[key] = association;

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
      this.database.get(key, function(err, association) {
        if(err) {
          return callback(400);
        }
        else if((association === undefined) ||
                !association.hasOwnProperty(property)) {
          return callback(404);
        }

        delete association[property];

        self.database.set(key, association, function(err) {
          if(err) {
            return callback(400);
          }
          else {
            let data = { associations: {} };
            data.associations[key] = association;
            return callback(200, { associations: association });
          }
        });
      });
    }

    // Delete the entire association
    else {
      this.database.delete(key, function(err, isRemoved) {
        if(err) {
          return callback(400);
        }
        else if(!isRemoved) {
          return callback(404);
        }
        else {
          return callback(200);
        }
      });
    }
  }

}


module.exports = AssociationsManager;
