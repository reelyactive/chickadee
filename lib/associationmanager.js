/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');

var ASSOCIATION_DB = "urls.db";
var TEST_ASSOCIATION = { "_id": "001bc50940100000",
                         "url": "http://reelyactive.com/metadata/test.json" };


/**
 * AssociationManager Class
 * Manages the association of identifiers with URLs
 * @constructor
 */
function AssociationManager() {
  var self = this;
  this.db = new nedb({filename: ASSOCIATION_DB, autoload: true });
  this.db.insert(TEST_ASSOCIATION);
};


/**
 * Find and append any URL associated with each device identifier
 * @param {Object} identifiers List of identifiers.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.addUrls = function(identifiers, callback) {
  var self = this;
  var ids = Object.keys(identifiers);

  this.db.find({ _id: { $in: ids } }, function(err, urls) {
    var lookup = {};
    for(cUrl = 0; cUrl < urls.length; cUrl++) {
      lookup[urls[cUrl]._id] = urls[cUrl].url;
    }
    for(id in lookup) {
      identifiers[id].url = lookup[id];
    }
    for(id in identifiers) {
      if(!identifiers[id].url) {
        makeExternalAssociation(identifiers[id]);
      }
    }
    callback(identifiers);
  });
}


/**
 * Attempts to associate a device with an external API
 * https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers
 * @param {Object} device The given device.
 */
function makeExternalAssociation(device) {
  if(device.identifier.type === "EUI-64") { // RA-T411
    device.url = "http://reelyactive.com/metadata/ra-t411.json";
    return
  }
  var advData = device.identifier.advData;
  var advHeader = device.identifier.advHeader;
  if(advData) {
    var complete128BitUUIDs = advData.complete128BitUUIDs;
    var nonComplete128BitUUIDs = advData.nonComplete128BitUUIDs;
    var complete16BitUUIDs = advData.complete16BitUUIDs;
    var nonComplete16BitUUIDs = advData.nonComplete16BitUUIDs;
    var uuid = complete128BitUUIDs || nonComplete128BitUUIDs ||
               complete16BitUUIDs || nonComplete16BitUUIDs;
    switch(uuid) {
      case "7265656c794163746976652055554944":  // RA-R436
        device.url = "http://reelyactive.com/metadata/ra-r436.json";
        return;
      case "2f521f8c4d6f12269c600050e4c00067":  // WNDR
        device.url = "http://reelyactive.com/metadata/wndr.json";
                     // "http://getwndr.com/reelyactive/user/" + 
                     // advData.completeLocalName;
        return;
      case "d5060001a904deb947482c7f4a124842":  // MYO
        device.url = "http://reelyactive.com/metadata/myo.json";
        return;
      case "febf":  // Nod (OpenSpatial)
        device.url = "http://reelyactive.com/metadata/nod.json";
        return;
    }
    var manufacturerSpecificData = advData.manufacturerSpecificData;
    if(manufacturerSpecificData) {
      var iBeacon = manufacturerSpecificData.iBeacon;
      if(iBeacon) {
        var beaconId = iBeacon.uuid;
        switch(beaconId) {
          case "b9407f30f5f8466eaff925556b57fe6d": // Estimote
            device.url = "http://reelyactive.com/metadata/estimote.json";
            return;
          case "8deefbb9f7384297804096668bb44281": // Roximity
            device.url = "http://reelyactive.com/metadata/roximity.json";
            return;
          default:
            device.url = "http://reelyactive.com/metadata/ibeacon.json";
            return;
        }
      }
      var companyIdentifierCode = manufacturerSpecificData.companyIdentifierCode;
      switch(companyIdentifierCode) {
        case "004c": // Apple inc.
          device.url = "http://reelyactive.com/metadata/apple.json";
          return;
      }
    }
  } 
  if(advHeader) {
    var type = advHeader.type;
    if(type === "SCAN_REQ") { // Curious device
      device.url = "http://reelyactive.com/metadata/curious.json";
      return;      
    }
    else { // Unknown Bluetooth Smart device
      device.url = "http://reelyactive.com/metadata/bluetoothsmart.json";
    }
  }
}


/**
 * Create an association in the database if it doesn't already exist
 * @param {Object} identifier Identifier(s) to associate.
 * @param {String} url URL to associate.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.create = function(identifier, url, callback) {
  var self = this;
  var association = { identifier: identifier, url: url };

  // TODO: move all this identifier handling to a utils package
  if(!identifier) {
    callback("Identifier is missing");
  }
  else if(typeof identifier === 'string') {
    association._id = identifier;
  }
  else if(identifier instanceof Array) {
    for(distinctIdentifier in identifier) {
      if((distinctIdentifier.type === "EUI-64") ||
         ((distinctIdentifier.type === "ADVA-48") &&
          (distinctIdentifier.advHeader.txAdd === "public"))) {
        association._id = distinctIdentifier.value;
      }
    }
  }
  else if((identifier.type === "EUI-64") ||
          ((identifier.type === "ADVA-48") &&
           (identifier.advHeader.txAdd === "public"))) {
    association._id = identifier.value;
  }

  this.db.insert(association, function(err, newDoc) {
    var id = null;
    if(err && (err.errorType == 'uniqueViolated')) {
      err = "Association id already exists";
    }
    if(newDoc) { id = newDoc._id; }
    callback(err, id);
  });
}


/**
 * Replace an association in the database, create if it doesn't exist
 * @param {String} id The id of the association.
 * @param {Object} identifier Identifier to associate.
 * @param {String} url URL to associate.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.replace = function(id, identifier, url, callback) {
  var self = this;
  var association = { identifier: identifier, url: url };

  if(!identifier) {
    callback("Identifier is missing");
  }
  else {
    this.db.update({ _id: id }, { $set: association }, { upsert: true },
                   function(err, numReplaced, newDoc) {
      if(err) { err = err.message; }
      if(newDoc) { id = newDoc._id; }
      callback(err, id);
    });
  }
}


/**
 * Remove an association from the database
 * @param {String} id Identifier to remove.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.remove = function(id, callback) {
  var self = this;
  this.db.remove({ _id: id }, function(err, numReplaced) {
    callback();
  });
}


module.exports = AssociationManager;
