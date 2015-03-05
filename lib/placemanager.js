/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');

var PLACE_DB = "hlc-places.db";
var TEST_NAME = "test";
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
 * Replace a place in the database
 * @param {String} name Name of the place to update.
 * @param {String} ids Comma-separated list of ids associated with the place.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.replace = function(name, ids, callback) {
  var self = this;

  if(!ids) {
    callback("Identifiers are missing");
  }
  else {
    var idArray = ids.split(',');
    var association = { ids: idArray };
    this.db.update({ _id: name }, { $set: association }, { upsert: true },
                   function(err, numReplaced, place) {
      if(err) { err = err.message; }
      if(place) {
        id = place._id;
        delete place._id;
      }
      else { place = association };
      callback(err, name, place);
    });
  }
}




/**
 * Retrieve the given place, if defined
 * @param {String} name Name of the place to search for.
 * @param {function} callback Function to call on completion.
 */
PlaceManager.prototype.retrieve = function(name, callback) {
  var self = this;

  if(name === TEST_NAME) {
    callback(null, TEST_NAME, { ids: TEST_IDS });
  }
  else {
    this.db.find({ _id: name }, function(err, places) {
      var place = places[0];
      if(err) { err = err.message; }
      if(place) {
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


module.exports = PlaceManager;
