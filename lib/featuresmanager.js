/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */

const crypto = require('crypto');


const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;


/**
 * FeaturesManager Class
 * Manages the storage and retrieval of GeoJSON features.
 */
class FeaturesManager {

  /**
   * FeaturesManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, database) {
    options = options || {};

    this.database = database;
    this.featureCollectionChangeCallbacks = [];
  }

  /**
   * Retrieve an existing feature.
   * @param {String} id The id of the feature.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, callback) {
    if(id) {
      this.database.get(id, function(err, feature) {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else if(feature === undefined) {
          return callback(HTTP_STATUS_NOT_FOUND);
        }
        else {
          let data = { features: {} };
          data.features[id] = feature;
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
          let features = {};
          for(let key of result.keys()) {
            features[key] = {};
          }
          return callback(HTTP_STATUS_OK, { features: features });
        }
      });
    }
  }

  /**
   * Create a feature.
   * @param {Object} feature The feature data.
   * @param {callback} callback Function to call on completion.
   */
  create(feature, callback) {
    let self = this;
    let key = crypto.randomUUID().replaceAll('-', '');

    self.database.set(key, feature, function(err) {
      if(err) {
        return callback(HTTP_STATUS_BAD_REQUEST);
      }
      else {
        let data = { features: {} };
        data.features[key] = feature;

        handleChangeCallbacks(self);
        return callback(HTTP_STATUS_OK, data);
      }
    });
  }

  /**
   * Replace a feature.
   * @param {String} id The id of the feature.
   * @param {Object} feature The feature data.
   * @param {callback} callback Function to call on completion.
   */
  replace(id, feature, callback) {
    let self = this;

    this.database.get(id, function(err, originalFeature) {
      if(err) {
        return callback(HTTP_STATUS_BAD_REQUEST);
      }
      else if(originalFeature === undefined) {
        return callback(HTTP_STATUS_NOT_FOUND);
      }

      self.database.set(id, feature, function(err) {
        if(err) {
          return callback(HTTP_STATUS_BAD_REQUEST);
        }
        else {
          let data = { features: {} };
          data.features[id] = feature;

          handleChangeCallbacks(self);
          return callback(HTTP_STATUS_OK, data);
        }
      });
    });
  }

  /**
   * Remove an existing feature.
   * @param {String} id The id of the feature.
   * @param {callback} callback Function to call on completion.
   */
  remove(id, callback) {
    let self = this;

    this.database.delete(id, function(err, isRemoved) {
      if(err) {
        return callback(HTTP_STATUS_BAD_REQUEST);
      }
      else if(!isRemoved) {
        return callback(HTTP_STATUS_NOT_FOUND);
      }
      else {
        handleChangeCallbacks(self);
        return callback(HTTP_STATUS_OK);
      }
    });
  }

  /**
   * Call the given callback whenever the featureCollection changes.
   * @param {callback} callback Function to call on feature collection change.
   */
  onFeatureCollectionChange(callback) {
    this.featureCollectionChangeCallbacks.push(callback);
    handleChangeCallbacks(this);
  }

}


/**
 * Handle any featureCollection change callbacks.
 * @param {FeaturesManager} instance The FeaturesManager instance.
 */
function handleChangeCallbacks(instance) {
  let hasCallbacks = (instance.featureCollectionChangeCallbacks.length > 0);

  if(hasCallbacks) {
    let featureCollection = { type: "FeatureCollection", features: [] };

    instance.database.find({}, function(err, result) {
      if(!err) {
        for(let feature of result.values()) {
          featureCollection.features.push(feature);
        }
      }
    });

    instance.featureCollectionChangeCallbacks.forEach((callback) => {
      callback(featureCollection);
    });
  }
}


module.exports = FeaturesManager;
