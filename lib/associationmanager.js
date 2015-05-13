/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');

var ASSOCIATION_DB = "associations.db";
var TEST_TRANSMITTER = { "_id": "001bc50940100000",
                         "url": "http://reelyactive.com/metadata/test.json" };
var TEST_RECEIVER_0 = { "_id": "001bc50940800000", "tags": [ "test" ] };
var TEST_RECEIVER_1 = { "_id": "001bc50940800001", "tags": [ "test" ] };
var TEST_RECEIVER_2 = { "_id": "001bc50940810000", "tags": [ "test" ] };
var TEST_RECEIVER_3 = { "_id": "001bc50940810001", "tags": [ "test" ] };

var TAGS_SPLIT_CHAR = ',';


/**
 * AssociationManager Class
 * Manages the association of identifiers with URLs
 * @constructor
 */
function AssociationManager() {
  var self = this;
  this.db = new nedb({filename: ASSOCIATION_DB, autoload: true });
  this.db.insert(TEST_TRANSMITTER);
  this.db.insert(TEST_RECEIVER_0);
  this.db.insert(TEST_RECEIVER_1);
  this.db.insert(TEST_RECEIVER_2);
  this.db.insert(TEST_RECEIVER_3);
};


/**
 * Find and append any URL associated with each device identifier
 * @param {Object} state State of devices.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.addUrls = function(state, callback) {
  var self = this;
  var devices = state.devices;
  var transmitterIDs = Object.keys(devices);
  var decoders = extractRadioDecoders(devices);
  var decoderIDs = Object.keys(decoders);
  var ids = transmitterIDs.concat(decoderIDs);

  this.db.find({ _id: { $in: ids } }, function(err, urls) {
    var lookup = {};

    // Create a lookup table of all registered associations
    for(cUrl = 0; cUrl < urls.length; cUrl++) {
      if(urls[cUrl].url) {
        lookup[urls[cUrl]._id] = urls[cUrl].url;
      }
    }

    // Add each radioDecoder to the list of devices
    for(var cDecoder = 0; cDecoder < decoderIDs.length; cDecoder++) {
      var decoderId = decoderIDs[cDecoder];
      devices[decoderId] = decoders[decoderId];
    }

    // Add a url to each device and remove the identifier and radioDecodings
    for(deviceId in devices) {
      var device = devices[deviceId];
      var lookupExists = lookup.hasOwnProperty(deviceId);
      if(lookupExists) {
        device.url = lookup[deviceId];
      }
      else {
        makeExternalAssociation(device);
      }
      delete device.identifier;
      delete device.radioDecodings;
    }
    callback(state);
  });
}


/**
 * Attempts to associate a device with an external API
 * https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers
 * @param {Object} device The given device.
 */
function makeExternalAssociation(device) {
  if(device.identifier.type === "EUI-64") {
    var oui36 = device.identifier.value.slice(0,9);
    switch(oui36) {
      case "001bc5094": // reelyActive
        if(device.identifier.value.substr(9,2) === '01') {
          device.url = "http://reelyactive.com/metadata/ra-t411.json";
        }
        else {
          device.url = "http://reelyactive.com/metadata/ra-rxxx.json";
        }
        return;
      default: // Unknown
        return;
    }
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
      case "adabfb006e7d4601bda2bffaa68956ba":  // Fitbit
        device.url = "http://reelyactive.com/metadata/fitbit.json";
        return;
      case "d5060001a904deb947482c7f4a124842":  // MYO
        device.url = "http://reelyactive.com/metadata/myo.json";
        return;
      case "a495ff10c5b14b44b5121370f02d74de":  // Bean (PunchThrough)
        device.url = "http://reelyactive.com/metadata/bean.json";
        return;
      case "bd4ac6100b4511e38ffd0800200c9a66":  // August Smart Lock
        device.url = "http://reelyactive.com/metadata/august.json";
        return;
      case "0f3e":  // TrackR
        device.url = "http://reelyactive.com/metadata/trackr.json";
        return;
      case "febf":  // Nod (OpenSpatial)
        device.url = "http://reelyactive.com/metadata/nod.json";
        return;
      case "fed8":  // Physical Web (Google)
        if(advData.serviceData && advData.serviceData.uriBeacon &&
           advData.serviceData.uriBeacon.url) {
          device.url = advData.serviceData.uriBeacon.url;
        }
        else {
          device.url = "http://reelyactive.com/metadata/physicalweb.json";
        }
        return;
      case "feed":  // Tile
        device.url = "http://reelyactive.com/metadata/tile.json";
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
          case "f7826da64fa24e988024bc5b71e0893e": // Kontakt.io
            device.url = "http://reelyactive.com/metadata/kontakt.json";
            return;
          case "8deefbb9f7384297804096668bb44281": // Roximity
            device.url = "http://reelyactive.com/metadata/roximity.json";
            return;
          case "f0018b9b75094c31a9051a27d39c003c": // LocosLab
            device.url = "http://reelyactive.com/metadata/locoslab.json";
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
        case "008c": // Gimbal inc.
          device.url = "http://reelyactive.com/metadata/gimbal.json";
          return;
      }
    }
    var serviceData = advData.serviceData;
    if(serviceData) {
      switch(serviceData.uuid) {
        case "fee6":  // Seed
          device.url = "http://reelyactive.com/metadata/seedlabs.json";
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
 * Retrieve an association from the database
 * @param {String} id The id of the association.
 * @param {String} property A specific association property to retrieve.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.retrieve = function(id, property, callback) {
  var self = this;
  var projection;

  switch(property) {
    case 'url':
      projection = { url: 1, _id: 0 };
      break;
    case 'directory':
      projection = { directory: 1, _id: 0 };
      break;
    case 'tags':
      projection = { tags: 1, _id: 0 };
      break;
    default:
      projection = { _id: 0 };
  }

  self.db.find({ _id: id }, projection, function(err, devices) {
    var device = devices[0];
    if(err) { err = err.message; }
    else if(!device || (Object.keys(device).length === 0)) { device = null; }
    callback(err, id, device);
  });
}


/**
 * Replace an association in the database, create if it doesn't exist
 * @param {String} id The id of the association.
 * @param {String} url URL to associate.
 * @param {String} directory Directory to associate.
 * @param {Array} tags The tags to associate.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.replace = function(id, url, directory, tags,
                                                callback) {
  var self = this;
  var association = {};

  if(url) {
    association.url = url;
  }
  if(directory) {
    association.directory = directory;
  }
  if(tags) {
    association.tags = tags;
  }

  this.db.update({ _id: id }, { $set: association }, { upsert: true },
                 function(err, numReplaced, device) {
    if(err) { err = err.message; }
    if(device) {
      id = device._id;
      delete device._id;
    }
    else { device = association };
    callback(err, id, device);
  });
}


/**
 * Remove an association from the database
 * @param {String} id Identifier to remove.
 * @param {String} property A specific association property to retrieve.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.remove = function(id, property, callback) {
  var self = this;

  if(!property) {
    self.db.remove({ _id: id }, function(err, numRemoved) {
      if(err) { err = err.message; }
      else if(numRemoved === 0) { err = "Identifier not found"; }
      callback(err);
    });
  }
  else {
    var unset = {};
    if(property === 'url') {
      unset = { url: true };
    }
    else if(property === 'directory') {
      unset = { directory: true };
    }
    else if(property === 'tags') {
      unset = { tags: true };
    }
    self.db.update({ _id: id }, { $unset: unset }, {},
                   function(err, numReplaced) {
      if(err) { err = err.message; }
      else if(numReplaced === 0) { err = "Identifier not found"; }
      callback(err);
    });
  }
}


/**
 * Retrieve the ids associated with the given parameters
 * @param {String} directory The association directory to search for.
 * @param {String} tags The assocation tags to search for.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.retrieveIdsByParams = function(directory, tags,
                                                            callback) {
  var self = this;
  var query = {};
  var ids = [];

  if(directory) {
    var regex = new RegExp('^' + directory + '([:]+|$)');
    query = { directory: { $regex: regex } };
  }
  else if(tags) {
    var tagsArray = tags.split(TAGS_SPLIT_CHAR);
    query = { tags: { $in: tagsArray } };
  }
  else {
    callback(ids);
  }

  self.db.find(query, { _id: 1 }, function(err, devices) {
    if(!devices) {
      callback(ids);
    }
    else {
      for(var cDevice = 0; cDevice < devices.length; cDevice++) {
        ids.push(devices[cDevice]._id);
      }
      callback(ids);
    }
  });
}


/**
 * Extract the radio decoders from the given list of devices.
 * @param {Object} devices The given devices.
 */
function extractRadioDecoders(devices) {
  var radioDecoders = {};

  for(deviceId in devices) {
    var radioDecodings = devices[deviceId].radioDecodings || [];
    for(var cDecoding = 0; cDecoding < radioDecodings.length; cDecoding++) {
      var radioDecoder = radioDecodings[cDecoding].identifier;
      var radioDecoderId = radioDecoder.value;
      radioDecoders[radioDecoderId] = { identifier: radioDecoder };
    }
  }

  return radioDecoders;
}


module.exports = AssociationManager;
