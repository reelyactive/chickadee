/**
 * Copyright reelyActive 2015-2016
 * We believe in an open Internet of Things
 */


var nedb = require('nedb');
var reelib = require('reelib');
var sniffypedia = require('sniffypedia');

var SNIFFYPEDIA_ROOT_URL = 'https://sniffypedia.org/';
var DEFAULT_DATA_FOLDER = 'data';
var ASSOCIATION_DB = 'associations.db';
var TEST_TRANSMITTER = { "_id": "001bc50940100000",
                         "url": "http://reelyactive.com/metadata/test.json" };
var TEST_RECEIVER_0 = { "_id": "001bc50940800000", "tags": ["test"] };
var TEST_RECEIVER_1 = { "_id": "001bc50940800001", "tags": ["test"] };
var TEST_RECEIVER_2 = { "_id": "001bc50940810000", "tags": ["test"] };
var TEST_RECEIVER_3 = { "_id": "001bc50940810001", "tags": ["test"] };

var TAGS_SPLIT_CHAR = ',';
var DEFAULT_DEVICE_URL = null;
var DEFAULT_DEVICE_TAGS = [];
var DEFAULT_DEVICE_DIRECTORY = null;

var UUID_URL_PREFIX = '53746f727920494420';
var UUID_URL_BASE_URL = 'http://myjson.info/s/';


/**
 * AssociationManager Class
 * Manages the association of identifiers with URLs
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function AssociationManager(options) {
  var self = this;

  self.associationsRootUrl = options.associationsRootUrl ||
                             SNIFFYPEDIA_ROOT_URL;
  var datafolder = options.persistentDataFolder || DEFAULT_DATA_FOLDER;
  var filename = ASSOCIATION_DB;
  if(options.persistentDataFolder !== '') {
    filename = datafolder.concat('/' + filename);
  }

  self.db = new nedb({ filename: filename, autoload: true });
  self.db.insert(TEST_TRANSMITTER);
  self.db.insert(TEST_RECEIVER_0);
  self.db.insert(TEST_RECEIVER_1);
  self.db.insert(TEST_RECEIVER_2);
  self.db.insert(TEST_RECEIVER_3);
}


/**
 * Find and append all associations for each device identifier
 * @param {Object} req The request which originated this function call.
 * @param {Object} state State of devices.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.addAssociations = function(req, state, callback) {
  var self = this;
  var devices = state.devices;
  var transmitterIDs = Object.keys(devices);
  var decoders = extractRadioDecoders(devices);
  var decoderIDs = Object.keys(decoders);
  var associationIDs = extractAssociationIds(devices);
  var ids = transmitterIDs.concat(decoderIDs).concat(associationIDs);

  // Add each radioDecoder to the list of devices
  for(var cDecoder = 0; cDecoder < decoderIDs.length; cDecoder++) {
    var decoderId = decoderIDs[cDecoder];
    devices[decoderId] = decoders[decoderId];
    devices[decoderId].directory = DEFAULT_DEVICE_DIRECTORY;
  }

  // Get the associations from the database, then append
  getAssociations(self, ids, function(err, associations) {
    self.appendAssociations(state, associations, callback);
  });
};


/**
 * Retrieve from the database the associations of the given ids
 * @param {Object} instance The given Chickadee instance.
 * @param {Array} ids The given ids.
 * @param {function} callback Function to call on completion.
 */
function getAssociations(instance, ids, callback) {
  instance.db.find({ _id: { $in: ids } }, function(err, associations) {
    for(var cAssociation = 0; cAssociation < associations.length;
        cAssociation++) {
      associations[cAssociation].deviceId = associations[cAssociation]._id;
    }
    callback(err, associations);
  });
}


/**
 * Append the given associations to the devices in the given state
 * @param {Object} state State of devices.
 * @param {Object} associations The associations queried from the database.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.appendAssociations = function(state, associations,
                                                           callback) {
  var self = this;
  var devices = state.devices;
  var lookup = {};

  // Create a lookup table of all registered associations
  for(cAssociation = 0; cAssociation < associations.length; cAssociation++) {
    lookup[associations[cAssociation].deviceId] = associations[cAssociation];
  }

  // Add associations to each device and remove the identifier
  for(var deviceId in devices) {
    var device = devices[deviceId];
    var lookupExists = lookup.hasOwnProperty(deviceId);

    // Add explicit associations based on device ID
    if(lookupExists) {
      device.url = lookup[deviceId].url || DEFAULT_DEVICE_URL;
      device.tags = lookup[deviceId].tags || DEFAULT_DEVICE_TAGS;
      if(lookup[deviceId].directory) {
        device.directory = lookup[deviceId].directory;
      }
    }

    // Otherwise, add associations based on association ids
    else {
      var hasAssociationIds = device.hasOwnProperty("associationIds");
      if(hasAssociationIds) {
        lookupExists = false;
        for(var cId = 0; ((cId < device.associationIds.length) &&
                          !lookupExists); cId++) {
          var associationId = device.associationIds[cId];
          lookupExists = lookup.hasOwnProperty(associationId);
          if(lookupExists) {
            device.url = lookup[associationId].url || DEFAULT_DEVICE_URL;
            device.tags = lookup[associationId].tags || DEFAULT_DEVICE_TAGS;
          }
        }
      }

      // No explicit associations on any ids, go implicit
      if(!device.hasOwnProperty("url") ||
         device.url === DEFAULT_DEVICE_URL) {
        device.tags = DEFAULT_DEVICE_TAGS;
        device.url = makeExternalAssociation(device, 
                                             self.associationsRootUrl);
      }
    }
    delete device.identifier;

    // Substitute radioDecodings for nearest
    if(device.radioDecodings) {
      device.nearest = [];

      for(var cDecoding = 0; cDecoding < device.radioDecodings.length;
          cDecoding++) {
        var decoding = device.radioDecodings[cDecoding];
        device.nearest[cDecoding] = {
          device: decoding.identifier.value,
          rssi: decoding.rssi
        };
      }
      delete device.radioDecodings;
    }
  }
  callback(state);
};


/**
 * Attempts to associate a device with an external URL
 * @param {Object} device The given device.
 * @param {String} rootUrl The given root URL.
 * @return {String} The externally associated URL, if any.
 */
function makeExternalAssociation(device, rootUrl) {

  // Special case of reelyActive proprietary Active RFID
  if(device.identifier.type === "EUI-64") {
    var oui36 = device.identifier.value.slice(0,9);
    switch(oui36) {
      case "001bc5094": // reelyActive
        if(device.identifier.value.substr(9,2) === '01') {
          return "http://sniffypedia.org/Product/reelyActive_RA-T411/";
        }
      default: // Unknown
        return DEFAULT_DEVICE_URL;
    }
  }

  // Special case of URL embedded in payload
  var advData = device.identifier.advData;
  if(advData) {
    var uuid = advData.complete128BitUUIDs;
    if(uuid && (uuid.substr(0,18) === UUID_URL_PREFIX)) { // UUID-URL
      var url = UUID_URL_BASE_URL;
      for(var cChar = 9; cChar < 16; cChar++) {
        url += String.fromCharCode(parseInt(uuid.substr(cChar * 2, 2), 16));
      }
      return url;
    }
    var serviceData = advData.serviceData;
    if(serviceData) {
      switch(serviceData.uuid) {
        case "feaa":  // Eddystone (Google)
          if(serviceData && serviceData.eddystone &&
             serviceData.eddystone.url) {
            return serviceData.eddystone.url;
          }
        case "fed8":  // Physical Web (Google)
          if(serviceData && serviceData.uriBeacon &&
             serviceData.uriBeacon.url) {
            return serviceData.uriBeacon.url;
          }
      }
    }
  }

  // Standard Sniffypedia case
  var hasAssociationIds = device.hasOwnProperty("associationIds");
  if(hasAssociationIds) {
    var lookupExists = false;
    var ble = sniffypedia.index.ble;
    var urls = {};
    for(var cId = 0; cId < device.associationIds.length; cId++) {
      var associationId = device.associationIds[cId];
      if((associationId.length === 40) && // iBeacon (trim major & minor)
         (ble.iBeacons.hasOwnProperty(associationId.substr(0,32)))) {
        urls.iBeacon = assembleUrl(ble.iBeacons[associationId.substr(0,32)],
                                   rootUrl);
      }
      else if((associationId.length === 32) &&
              (ble.uuid128.hasOwnProperty(associationId))) {
        urls.uuid128 = assembleUrl(ble.uuid128[associationId], rootUrl);
      }
      else if(associationId.length === 4) {
        if(ble.uuid16.hasOwnProperty(associationId)) {
          urls.uuid16 = assembleUrl(ble.uuid16[associationId], rootUrl);
        }
        else if(ble.companyIdentifiers.hasOwnProperty(associationId)) {
          urls.companyIdentifier = assembleUrl(
                              ble.companyIdentifiers[associationId], rootUrl);
        }
      }
    }

    if(Object.keys(urls).length !== 0) {
      return urls.iBeacon || urls.uuid128 || urls.uuid16 ||
             urls.companyIdentifier; // In order of precedence
    }
  }

  // Catch-all
  var advHeader = device.identifier.advHeader;
  if(advHeader) {
    var type = advHeader.type;
    if(type === "SCAN_REQ") { // Curious device
      return "http://sniffypedia.org/Product/Any_Curious-Device/";
    }
    else { // Unknown Bluetooth Low Energy device
      return "http://sniffypedia.org/Organization/Bluetooth_SIG_Inc/";
    }
  }
}


/**
 * Assembles a URL from the target and the root URL, if required
 * @param {String} target The given target URL.
 * @param {String} rootUrl The given root URL.
 * @return {String} The full URL, assembled if required.
 */
function assembleUrl(target, rootUrl) {

  // Target is a full URL
  if(target.substr(0,4) === 'http') {
    return target;
  }

  // Target is a URL, add protocol, host and port (rootUrl)
  return rootUrl + target;
}


/**
 * Retrieve associations from the database
 * @param {Object} req The request which originated this function call.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.retrieveMany = function(req, callback) {
  callback(new Error('Not implemented.'), null);
}


/**
 * Retrieve an association from the database
 * @param {Object} req The request which originated this function call.
 * @param {String} id The id of the association.
 * @param {String} property A specific association property to retrieve.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.retrieve = function(req, id, property, callback) {
  var self = this;
  var projection;
  var isValidID = reelib.identifier.isValid(id);

  if(!isValidID) {
    callback('Invalid id', id);
    return;
  }

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
    if(err) {
      err = err.message;
    }
    else if(!device || (Object.keys(device).length === 0)) {
      device = null;
    }
    callback(err, id, device);
  });
};


/**
 * Replace an association in the database, create if it doesn't exist
 * @param {Object} req The request which originated this function call.
 * @param {String} id The id of the association.
 * @param {String} url URL to associate.
 * @param {String} directory Directory to associate.
 * @param {Array} tags The tags to associate.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.replace = function(req, id, url, directory, tags,
                                                callback) {
  var self = this;
  var association = {};
  var isValidID = reelib.identifier.isValid(id);

  if(!isValidID) {
    callback('Invalid id', id);
    return;
  }

  if(url) {
    association.url = url;
  }
  if(directory) {
    association.directory = directory;
  }
  if(tags) {
    association.tags = tags;
  }

  self.db.update({ _id: id }, { $set: association }, { upsert: true },
                 function(err, numReplaced, device) {
    if(err) {
      err = err.message;
    }
    if(device) {
      id = device._id;
      delete device._id;
    }
    else {
      device = association;
    }
    callback(err, id, device);
  });
};


/**
 * Remove an association from the database
 * @param {Object} req The request which originated this function call.
 * @param {String} id Identifier to remove.
 * @param {String} property A specific association property to retrieve.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.remove = function(req, id, property, callback) {
  var self = this;
  var isValidID = reelib.identifier.isValid(id);

  if(!isValidID) {
    callback('Invalid id');
    return;
  }

  if(!property) {
    self.db.remove({ _id: id }, function(err, numRemoved) {
      if(err) {
        err = err.message;
      }
      else if (numRemoved === 0) {
        err = "Identifier not found";
      }
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
      if(err) {
        err = err.message;
      }
      else if(numReplaced === 0) {
        err = "Identifier not found";
      }
      callback(err);
    });
  }
};


/**
 * Retrieve the ids associated with the given parameters
 * @param {Object} req The request which originated this function call.
 * @param {String} directory The association directory to search for.
 * @param {String} tags The assocation tags to search for.
 * @param {function} callback Function to call on completion.
 */
AssociationManager.prototype.retrieveIdsByParams = function(req, directory,
                                                            tags, callback) {
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
};


/**
 * Extract the radio decoders from the given list of devices.
 * @param {Object} devices The given devices.
 */
function extractRadioDecoders(devices) {
  var radioDecoders = {};

  for(var deviceId in devices) {
    var radioDecodings = devices[deviceId].radioDecodings || [];
    for(var cDecoding = 0; cDecoding < radioDecodings.length; cDecoding++) {
      var radioDecoder = radioDecodings[cDecoding].identifier;
      var radioDecoderId = radioDecoder.value;
      radioDecoders[radioDecoderId] = { identifier: radioDecoder };
    }
  }

  return radioDecoders;
}


/**
 * Extract all non-duplicate association ids from the given list of devices,
 * adding an assocationIds field to each device when absent.
 * @param {Object} devices The given devices.
 * @return {Array} Non-duplicate association identifiers.
 */
function extractAssociationIds(devices) {
  var associationIds = [];

  for(var deviceId in devices) {
    var device = devices[deviceId];
    var hasAssociationIds = device.hasOwnProperty("associationIds");
    if(!hasAssociationIds) {
      device.associationIds = reelib.tiraid.getAssociationIds(device);
    }
    for(var cId = 0; cId < device.associationIds.length; cId++) {
      if(associationIds.indexOf(device.associationIds[cId]) < 0) {
        associationIds.push(device.associationIds[cId]);
      }
    }
  }

  return associationIds;
}


module.exports = AssociationManager;
module.exports.makeExternalAssociation = makeExternalAssociation;
module.exports.extractRadioDecoders = extractRadioDecoders;
