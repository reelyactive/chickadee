/**
 * Copyright reelyActive 2022-2026
 * We believe in an open Internet of Things
 */

const crypto = require('crypto');


const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const VALID_FEATURE_GEOMETRIES = [ 'Point', 'MultiPoint', 'LineString',
                                   'MultiLineString', 'Polygon', 'MultiPolygon',
                                   'GeometryCollection' ];


/**
 * FeaturesManager Class
 * Manages the storage and retrieval of GeoJSON features.
 */
class FeaturesManager {

  /**
   * FeaturesManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Chimps} chimps The chimps instance.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, chimps, database) {
    let self = this;
    options = options || {};

    this.database = database;
    this.isDatabaseReady = false;
    this.watchCallbacks = [];

    if(chimps && (typeof chimps.setFeatureCollection === 'function')) {
      this.watchCallbacks.push(chimps.setFeatureCollection.bind(chimps));
    }
  }

  /*
   * Complete initialisation following database readiness.
   */
  init() {
    this.isDatabaseReady = true;
    updateWatchers(this);
  }

  /**
   * Watch the features, passing them via the provided callback on change.
   * @param {callback} callback The function to call when features change.
   * @param {Object} options The optional options.
   */
  watch(callback, options) {
    if(typeof callback === 'function') {
      this.watchCallbacks.push(callback);

      if(this.isDatabaseReady) {
        updateWatchers(this); // TODO: only update this watcher/callback?
      }
    }
  }

  /**
   * Retrieve an existing feature.
   * @param {String} id The id of the feature.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, callback) {
    if(id) {
      this.database.get(id, (err, feature) => {
        if(err) {
          return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
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

      this.database.find(query, (err, result) => {
        if(err) {
          return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
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

    if(!isValidFeature(feature)) {
      return callback(HTTP_STATUS_BAD_REQUEST);
    }

    let key = crypto.randomUUID().replaceAll('-', '');
    feature.id = feature.id || key;

    this.database.set(key, feature, (err) => {
      if(err) {
        return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
      else {
        let data = { features: {} };
        data.features[key] = feature;

        updateWatchers(self);
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

    if(!isValidFeature(feature)) {
      return callback(HTTP_STATUS_BAD_REQUEST);
    }

    this.database.get(id, (err, originalFeature) => {
      if(err) {
        return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
      else if(originalFeature === undefined) {
        return callback(HTTP_STATUS_NOT_FOUND);
      }

      self.database.set(id, feature, (err) => {
        if(err) {
          return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
        }
        else {
          let data = { features: {} };
          data.features[id] = feature;

          updateWatchers(self);
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

    this.database.delete(id, (err, isRemoved) => {
      if(err) {
        return callback(HTTP_STATUS_INTERNAL_SERVER_ERROR);
      }
      else if(!isRemoved) {
        return callback(HTTP_STATUS_NOT_FOUND);
      }
      else {
        updateWatchers(self);
        return callback(HTTP_STATUS_OK);
      }
    });
  }

}


/**
 * Check if the given feature is valid GeoJSON.
 * See RFC 7946 for reference.
 * @param {Object} feature The GeoJSON feature to check.
 * @returns {Boolean} True if it is valid, false otherwise.
 */
function isValidFeature(feature) {
  if(!feature ||
     (feature.type !== 'Feature') ||
     !feature.hasOwnProperty('properties') ||
     !VALID_FEATURE_GEOMETRIES.includes(feature.geometry.type)) {
    return false;
  }

  return true;
}


/**
 * Update any watchers (including chimps).
 * @param {FeaturesManager} instance The FeaturesManager instance.
 */
function updateWatchers(instance) {
  if(instance.watchCallbacks.length > 0) {
    let featureCollection = { type: "FeatureCollection", features: [] };

    instance.database.find({}, (err, result) => {
      if(!err) {
        for(let feature of result.values()) {
          featureCollection.features.push(feature);
        }

        instance.watchCallbacks.forEach((watchCallback) => {
          if(typeof watchCallback === 'function') {
            watchCallback(featureCollection);
          }
        });
      }
    });
  }
}


module.exports = FeaturesManager;
