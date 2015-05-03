/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');

var PLACE_DB = "hlc-places.db";
var TEST_NAME = "test";
var TEST_DEVICES = [ { id: "001bc50940800000", type: "infrastructure" },
                     { id: "001bc50940810000", type: "infrastructure" } ];


/**
 * PlaceManager Class
 * Manages the database of places
 * @constructor
 */
function PlaceManager() {
  var self = this;
  this.db = new nedb( { filename: PLACE_DB, autoload: true } );
};


/**
 * Create a new place in the database
 * @param {String} name Name of the place to add.
 * @param {Array} devices The devices associated with the place.
 * @param {String} url The URL associated with the place.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.create = function(name, devices, url, callback) {
  var self = this;
  var association = {};

  if(name) {
    association._id = name;
  }
  if(devices) {
    association.devices = devices;
  }
  else {
    association.devices = [];
  }
  if(url) {
    association.url = url;
  }

  this.db.insert(association, function(err, place) {
    var name;
    if(err && (err.errorType == 'uniqueViolated')) {
      err = "Place already exists";
    }
    if(place) {
      name = place._id;
      delete place._id;
    }
    callback(err, name, place);
  });
}


/**
 * Replace a place in the database
 * @param {String} name Name of the place to update.
 * @param {Array} devices The devices associated with the place.
 * @param {String} url The URL associated with the place.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.replace = function(name, devices, url, callback) {
  var self = this;
  var association = {};

  if(devices) {
    association.devices = devices;
  }
  else {
    association.devices = [];
  }
  if(url) {
    association.url = url;
  }

  this.db.update({ _id: name }, { $set: association }, { upsert: true },
                 function(err, numReplaced, place) {
    if(err) { err = err.message; }
    if(place) {
      if(place.ids) { // Legacy
        delete place.ids;
      }
      if(place.identifiers) { // Legacy
        place.devices = [];
        for(var cId = 0; cId < place.identifiers.length; cId++) {
          place.devices.push( { id: place.identifiers[cId],
                                type: "infrastructure" } );
        }
        delete place.identifiers;
      }
      name = place._id;
      delete place._id;
    }
    else { place = association };
    callback(err, name, place);
  });
}


/**
 * Retrieve the given place, if defined
 * @param {String} name Name of the place to search for.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.retrieve = function(name, callback) {
  var self = this;

  if(name === TEST_NAME) {
    callback(null, TEST_NAME, { devices: TEST_DEVICES });
  }
  else {
    this.db.find({ _id: name }, function(err, places) {
      var place = places[0];
      if(err) { err = err.message; }
      if(place) {
        if(place.ids) { // Legacy
          place.identifiers = place.ids;
          delete place.ids;
        }
        if(place.identifiers) { // Legacy
          place.devices = [];
          for(var cId = 0; cId < place.identifiers.length; cId++) {
            place.devices.push( { id: place.identifiers[cId],
                                  type: "infrastructure" } );
          }
          delete place.identifiers;
        }
        name = place._id;
        delete place._id;
      }
      callback(err, name, place);
    });
  }
}


/**
 * Remove a place from the database
 * @param {String} name Name of the place to remove.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.remove = function(name, callback) {
  var self = this;
  this.db.remove({ _id: name }, function(err, numRemoved) {
    if(err) { err = err.message; }
    else if(numRemoved === 0) { err = "Place not found"; }
    callback(err);
  });
}


/**
 * Replace an existing device associated with a place in the database
 * @param {String} name Name of the place to update.
 * @param {String} id The device id.
 * @param {Object} device The device information.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.replaceDevice = function(name, id, device, callback) {
  var self = this;

  device.id = id;

  this.db.update({ _id: name }, { $addToSet: { devices: device } }, {},
                 function(err, numReplaced) {
    if(err) { err = err.message; }
    var place = {};
    callback(err, name, place);
  });
}


/**
 * Remove a device associated with a place from the database
 * @param {String} name Name of the place to remove.
 * @param {String} id The device id.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.removeDevice = function(name, id, callback) {
  var self = this;

  this.db.update({ _id: name }, { $pull: { devices: { id: id } } }, {},
                 function(err, numReplaced) {
    if(err) { err = err.message; }
    callback(err);
  });
}


module.exports = PlaceManager;
