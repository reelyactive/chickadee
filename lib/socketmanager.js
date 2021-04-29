/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const CONTEXT_ROUTE = '/context';
const DEVICE_ROUTE = '/device';
const CONTEXT_ROUTE_REGEX = /^\/context[\/]?/;


/**
 * SocketManager Class
 * Manages the retrieval of wireless device data.
 */
class SocketManager {

  /**
   * SocketManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {SocketIO} io The socket.io instance.
   * @param {Barnacles} barnacles The barnacles instance.
   * @constructor
   */
  constructor(options, io, barnacles) {
    let self = this;
    options = options || {};

    this.activeNamespaces = new Map();
    this.barnacles = barnacles;

    if(io) {
      io.of(CONTEXT_ROUTE_REGEX).on('connection', function(socket) {
        handleSocketConnection(socket, self);
      });

      handleBarnaclesEvents(barnacles, self.activeNamespaces);
    }

  }

}


/**
 * Handle the given socket.io connection, serving data until disconnection.
 * @param {Socket} socket The socket connection.
 * @param {Barterer} instance The Barterer instance.
 */
function handleSocketConnection(socket, instance) {
  let namespace = socket.nsp;
  let route = namespace.name;
  instance.activeNamespaces.set(route, namespace);

  socket.on('disconnect', function(reason) {
    let isEmptyNamespace = (namespace.sockets.size === 0);

    if(isEmptyNamespace) {
      instance.activeNamespaces.delete(route);
    }
  });
}


/**
 * Handle the event stream from barnacles.
 * @param {Barnacles} barnacles The barnacles instance.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleBarnaclesEvents(barnacles, activeNamespaces) {
  barnacles.on('raddec', function(raddec) {
    handleRaddecEvent(raddec, activeNamespaces, barnacles);
  });

  barnacles.on('dynamb', function(dynamb) {
    handleDynambEvent(dynamb, activeNamespaces, barnacles);
  });
}


/**
 * Handle a raddec event from barnacles.
 * @param {raddec} raddec The raddec event.
 * @param {Map} activeNamespaces The active namespaces to update.
 * @param {Barnacles} barnacles The barnacles instance.
 */
function handleRaddecEvent(raddec, activeNamespaces, barnacles) {
  let deviceRoute = CONTEXT_ROUTE + DEVICE_ROUTE + '/' + raddec.signature;

  if(activeNamespaces.has(deviceRoute)) {
    barnacles.retrieveContext([ raddec.signature ], null, function(devices) {
      activeNamespaces.get(deviceRoute).emit('devices', devices);
    });
  }
}


/**
 * Handle a dynamb event from barnacles.
 * @param {dynamb} dynamb The dynamb event.
 * @param {Map} activeNamespaces The active namespaces to update.
 * @param {Barnacles} barnacles The barnacles instance.
 */
function handleDynambEvent(dynamb, activeNamespaces, barnacles) {
  let signature = dynamb.deviceId + '/' + dynamb.deviceIdType;
  let deviceRoute = CONTEXT_ROUTE + DEVICE_ROUTE + '/' + signature;

  if(activeNamespaces.has(deviceRoute)) {
    let isPossibleContextChange = dynamb.hasOwnProperty('nearest');

    if(isPossibleContextChange) {
      barnacles.retrieveContext([ signature ], null, function(devices) {
        activeNamespaces.get(deviceRoute).emit('devices', devices);
      });
    }
    else {
      activeNamespaces.get(deviceRoute).emit('dynamb', dynamb);
    }
  }
}


module.exports = SocketManager;