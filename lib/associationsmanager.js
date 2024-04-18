/**
 * Copyright reelyActive 2015-2023
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
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, callback) {
    let isSpecificAssociation = (id && type);

    if(isSpecificAssociation) {
      let key = id + '/' + type;

      this.database.get(key, function(err, association) {
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

      this.database.find(query, function(err, result) {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else {
          let associations = {};
          for(let key of result.keys()) {
            associations[key] = {};
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

    this.database.get(key, function(err, association) {
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

      self.database.set(key, association, function(err) {
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
      this.database.get(key, function(err, association) {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else if((association === undefined) ||
                !association.hasOwnProperty(property)) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }

        delete association[property];

        self.database.set(key, association, function(err) {
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
      this.database.delete(key, function(err, isRemoved) {
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
 * Set chimps' associations.
 * @param {AssociationsManager} instance The AssociationsManager instance.
 */
function updateChimps(instance) {
  if(instance.chimps) {
    instance.database.find({}, function(err, result) {
      if(!err) {
        instance.chimps.setAssociations(result);
      }
    });
  }
}


module.exports = AssociationsManager;
