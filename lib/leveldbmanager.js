/**
 * Copyright reelyActive 2015-2022
 * We believe in an open Internet of Things
 */


const level = require('level');


const DEFAULT_DATA_FOLDER = 'data';
const DEFAULT_ASSOCIATION_DB = 'associations';


/**
 * LevelDBManager Class
 * Manages a LevelDB database instance.
 */
class LevelDBManager {

  /**
   * LevelDBManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    let location = DEFAULT_DATA_FOLDER + '/' + DEFAULT_ASSOCIATION_DB;
    this.database = level(location, { valueEncoding: "json" });
  }

  /**
   * Insert a document in the database.
   * @param {Object} doc The document to insert.
   * @param {function} callback Function to call on completion.
   */
  insert(doc, callback) {
    let key = doc._id;
    let value = Object.assign({}, doc);

    delete value._id;

    this.database.put(key, value, function(err) {
      return callback(err, doc);
    });
  }

  /**
   * Find all documents that match the query in the database, observing the
   * given projection.
   * @param {Object} query The database query.
   * @param {Object} projection The projection to observe.
   * @param {function} callback Function to call on completion.
   */
  find(query, projection, callback) {
    query = query || {};

    // Query a single key
    if(query.hasOwnProperty('_id')) {
      this.database.get(query._id, function(err, value) {
        if(err && err.notFound) {
          return callback(null, []);
        }
        else if(err) {
          return callback(err);
        }
        else {
          let docs = [ Object.assign({ _id: query._id }, value) ];
          applyProjection(docs, projection);
          return callback(err, docs);
        }
      });
    }

    // Query all keys (TODO: other specific queries!)
    else {
      let docs = [];

      this.database.createReadStream()
        .on('data', function(data) {
          let doc = Object.assign({ _id: data.key }, data.value);
          docs.push(doc);
        })
        .on('error', function(err) {
          return callback(err);
        })
        .on('end', function() {
          applyProjection(docs, projection);
          return callback(null, docs);
        });
    }
  }

  /**
   * Update all documents that match the query in the database.
   * @param {Object} query The database query.
   * @param {Object} update The update to apply.
   * @param {Object} options The update options.
   * @param {function} callback Function to call on completion.
   */
  update(query, update, options, callback) { // TODO!
    if((typeof query !== 'object') && !query.hasOwnProperty('_id')) {
      return callback('Invalid query.');
    }

    let self = this;
    let isUpsert = false;

    this.database.get(query._id, function(err, value) {
      if(err && err.notFound) {
        isUpsert = true;
        value = {};
      }
      else if(err) {
        return callback(err);
      }

      let isModifier = ((typeof update === 'object') &&
                        (Object.keys(update).length > 0) &&
                        (Object.entries(update)[0][0].substring(0, 1) === '$'));

      if(isModifier) {
        let modifierName = Object.entries(update)[0][0];
        let modifierProperties = Object.entries(update)[0][1];

        switch(modifierName) {
          case '$set':
            for(const property in modifierProperties) {
              value[property] = modifierProperties[property];
            }
            break;
          // TODO: implement other modifiers
          default:
            return callback('Unhandled modifier.');
        }
      }
      else {
        value = update;
      }

      let doc = Object.assign({ _id: query._id }, value);

      self.database.put(query._id, value, function(err) {
        return callback(err, 1, [ doc ], isUpsert);
      });
    });
  }

  /**
   * Remove all documents that match the query in the database.
   * @param {Object} query The database query.
   * @param {Object} options The removal options.
   * @param {function} callback Function to call on completion.
   */
  remove(query, options, callback) {
    query = query || {};

    // Query a single key
    if(query.hasOwnProperty('_id')) {
      this.database.del(query._id, function(err) {
        return callback(err);
      });
    }

    // TODO: handle complex delete queries
    else {
      return callback('Complex delete queries not implemented.');
    }
  }
}


/**
 * Apply the given projection to the given docs.
 * @param {Array} docs The documents on which to work.
 * @param {Object} projection The projection to apply.
 */
function applyProjection(docs, projection) {
  if((typeof projection !== 'object') ||
     (Object.keys(projection).length === 0)) {
    return;
  }

  // TODO: handle projections of 1 rather than 0

  for(let doc of docs) {
    for(const property in projection) {
      if(projection[property] === 0) {
        delete doc[property];
      }
    }
  }
}


module.exports = LevelDBManager;
