/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');

var PLACE_DB = "hlc-places.db";
var TEST_PLACE = "test";
var TEST_IDS = [ "001bc50940800000", "001bc50940810000" ];


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
 * Find all IDs associated with the given place, if defined
 * @param {String} place Place to search for.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.getIDs = function(place, callback) {
  var self = this;
  var placeIDs = [];

  if(place === TEST_PLACE) {
    placeIDs = TEST_IDS;
    callback(placeIDs);
  }
  else {
    this.db.find({ _id: place }, { _id: 0 }, function(err, ids) {
      if(!ids[0]) {
        callback(placeIDs);
        return;
      }
      placeIDs = ids[0].ids;
      callback(placeIDs);
    });
  }
}


/**
 * Create a new place in the database
 * @param {String} name Name of the place to add.
 * @param {String} ids Comma-separated list of ids associated with the place.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.create = function(name, ids, callback) {
  var self = this;

  if(!name) {
    callback("Place name is missing");
  }
  else if(!ids) {
    callback("Identifiers are missing");
  }
  else {
    var idArray = ids.split(',');
    var association = { _id: name, ids: idArray };
    this.db.insert(association, function(err, place) {
      var id;
      if(err && (err.errorType == 'uniqueViolated')) {
        err = "Place already exists";
      }
      if(place) {
        id = place._id;
        delete place._id;
      }
      callback(err, id, place);
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


module.exports = PlaceManager;
