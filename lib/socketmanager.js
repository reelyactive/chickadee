/**
 * Copyright reelyActive 2021-2023
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
   * @param {Chimps} chimps The optional chimps instance.
   * @param {ContextManager} context The ContextManager instance.
   * @constructor
   */
  constructor(options, io, barnacles, chimps, context) {
    let self = this;
    options = options || {};

    this.activeNamespaces = new Map();
    this.barnacles = barnacles;
    this.chimps = chimps;
    this.context = context;

    if(io) {
      io.of(CONTEXT_ROUTE_REGEX).on('connection', function(socket) {
        handleSocketConnection(socket, self);
      });

      handleBarnaclesEvents(barnacles, self.activeNamespaces, context);
      if(self.chimps) {
        handleChimpsEvents(chimps, self.activeNamespaces);
      }
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
 * @param {ContextManager} context The ContextManager instance.
 */
function handleBarnaclesEvents(barnacles, activeNamespaces, context) {
  barnacles.on('raddec', function(raddec) {
    handleRaddecEvent(raddec, activeNamespaces, context);
  });

  barnacles.on('dynamb', function(dynamb) {
    handleDynambEvent(dynamb, activeNamespaces, context);
  });
}


/**
 * Handle the event stream from chimps.
 * @param {Chimps} chimps The chimps instance.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleChimpsEvents(chimps, activeNamespaces) {
  chimps.on('spatem', function(spatem) {
    handleSpatemEvent(spatem, activeNamespaces);
  });
}


/**
 * Handle a raddec event from barnacles.
 * @param {raddec} raddec The raddec event.
 * @param {Map} activeNamespaces The active namespaces to update.
 * @param {ContextManager} context The ContextManager instance.
 */
function handleRaddecEvent(raddec, activeNamespaces, context) {
  let deviceRoute = CONTEXT_ROUTE + DEVICE_ROUTE + '/' + raddec.signature;

  if(activeNamespaces.has(deviceRoute)) {
    context.retrieve(raddec.transmitterId, raddec.transmitterIdType, null,
                     null, function(status, response) {
      activeNamespaces.get(deviceRoute).emit('devices', response.devices);
    });
  }
}


/**
 * Handle a dynamb event from barnacles.
 * @param {dynamb} dynamb The dynamb event.
 * @param {Map} activeNamespaces The active namespaces to update.
 * @param {ContextManager} context The ContextManager instance.
 */
function handleDynambEvent(dynamb, activeNamespaces, context) {
  let signature = dynamb.deviceId + '/' + dynamb.deviceIdType;
  let deviceRoute = CONTEXT_ROUTE + DEVICE_ROUTE + '/' + signature;

  if(activeNamespaces.has(deviceRoute)) {
    let isPossibleContextChange = dynamb.hasOwnProperty('nearest');

    if(isPossibleContextChange) {
      context.retrieve(dynamb.deviceId, dynamb.deviceIdType, null, null,
                       function(status, response) {
        activeNamespaces.get(deviceRoute).emit('devices', response.devices);
      });
    }
    else {
      activeNamespaces.get(deviceRoute).emit('dynamb', dynamb);
    }
  }
}


/**
 * Handle a spatem event from chimps.
 * @param {spatem} spatem The spatem event.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleSpatemEvent(spatem, activeNamespaces) {
  let signature = spatem.deviceId + '/' + spatem.deviceIdType;
  let deviceRoute = CONTEXT_ROUTE + DEVICE_ROUTE + '/' + signature;

  if(activeNamespaces.has(deviceRoute)) {
    activeNamespaces.get(deviceRoute).emit('spatem', spatem);
  }
}


module.exports = SocketManager;