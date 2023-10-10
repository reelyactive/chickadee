/**
 * Copyright reelyActive 2021-2023
 * We believe in an open Internet of Things
 */


let charlotte = (function() {

  // Internal constants
  const MAX_EXPECTED_RSSI = -30;
  const DEFAULT_MAX_EDGES_PER_NODE = 3;
  const DEFAULT_LAYOUT_NAME = 'fcose';
  const DEFAULT_FCOSE_LAYOUT_OPTIONS = {
      name: "fcose",
      quality: "default",
      animate: true,
      animationDuration: 1600,
      randomize: true,
      nodeRepulsion: (node) => { return 9000; },
      edgeElasticity: (edge) => {
          return 0.45 * MAX_EXPECTED_RSSI /
                        Math.min(MAX_EXPECTED_RSSI, edge.data('rssi')); },
      padding: 24,
      fixedNodeConstraint: []
  };
  const DEFAULT_GRAPH_STYLE = [
      { selector: "node",
        style: { label: "data(name)", "font-size": "0.6em", "color": "#666",
                 "min-zoomed-font-size": "16px" } },
      { selector: "node[image]",
        style: { "background-image": "data(image)", "border-color": "#83b7d0",
                 "background-fit": "cover cover", "border-width": "2px" } },
      { selector: "edge", style: { "curve-style": "haystack",
                                   "line-color": "#ddd", label: "data(name)",
                                   "text-rotation": "autorotate",
                                   color: "#5a5a5a", "font-size": "0.25em",
                                   "min-zoomed-font-size": "12px" } },
      { selector: ".cyDeviceNode",
        style: { "background-color": "#83b7d0", "border-color": "#83b7d0" } },
      { selector: ".cyAnchorNode",
        style: { "background-color": "#0770a2", "border-color": "#0770a2" } },
      { selector: ".cySelectedNode",
        style: { "background-color": "#ff6900", "border-color": "#ff6900" } }
  ];

  // Internal variables
  let graphs = new Map();
  let eventCallbacks = { tap: [] };


  // Initialise the web
  function init(target, options) {
    if(!target || !target.id) {
      throw new Error('charlotte.js cannot init without target/id.');
    }

    let graph = {};
    options = options || {};
    graph.digitalTwins = options.digitalTwins || new Map();
    graph.maxEdgesPerNode = options.maxEdgesPerNode ||
                            DEFAULT_MAX_EDGES_PER_NODE;

    let layoutName = options.layoutName || DEFAULT_LAYOUT_NAME;

    graph.options = {
        container: target,
        layout: options.layout ||
                Object.assign({}, DEFAULT_FCOSE_LAYOUT_OPTIONS),
        style: options.style || DEFAULT_GRAPH_STYLE
    };

    graph.cy = cytoscape(graph.options);
    graph.layout = graph.cy.layout({ name: layoutName, cy: graph.cy });
    //graph.cy.on('resize', updateLayout, graph); // TODO: handle resize?
    graph.cy.on('tap', handleNodeTap);

    graphs.set(target.id, graph);
  }


  // Spin a web
  function spin(devices, target, options) {
    if(!target || !target.id) {
      throw new Error('charlotte.js cannot spin without target/id.');
    }
    if(!graphs.has(target.id)) {
      throw new Error('charlotte.js cannot spin, init target first.');
    }

    let graph = graphs.get(target.id);

    if(devices instanceof Map) {
      graph.cy.nodes().forEach((node) => {
        if(!devices.has(node.id())) { graph.cy.remove(node); }
      });

      graph.options.layout.fixedNodeConstraint = [];

      devices.forEach((device, deviceSignature) => {
        addDeviceNode(deviceSignature, device, graph);
      });
    }
    else {
      let deviceSignatures = Object.keys(devices);

      graph.cy.nodes().forEach((node) => {
        let isPresent = deviceSignatures.includes(node.id());
        if(!isPresent) { graph.cy.remove(node); }
      });

      graph.options.layout.fixedNodeConstraint = [];

      for(const deviceSignature in devices) {
        addDeviceNode(deviceSignature, devices[deviceSignature], graph);
      }
    }

    fitConstraintToViewport(graph);
    updateLayout(graph);
  }


  // Update the digital twin of the identified node(s)
  function updateDigitalTwin(deviceSignature, digitalTwin) {
    digitalTwin = digitalTwin || {};
    let nodes = [];

    graphs.forEach((graph) => {
      let isExistingNode = (graph.cy.getElementById(deviceSignature).size()>0);
      if(isExistingNode) {
        nodes.push(graph.cy.getElementById(deviceSignature));
      }
    });

    nodes.forEach((node) => {
      updateNodeStoryCover(node, digitalTwin.storyCovers, deviceSignature); 
    });
  }


  // Select a specific node
  function selectNode(deviceSignature) {
    let isSelectedNodeFound = false;

    graphs.forEach((graph) => {
      if(graph.selectedDeviceSignature &&
         (graph.cy.getElementById(graph.selectedDeviceSignature).size() > 0)) {
        let formerNode = graph.cy.getElementById(graph.selectedDeviceSignature);
        formerNode.removeClass('cySelectedNode');
      }

      if(graph.cy.getElementById(deviceSignature).size() > 0) {
        let currentNode = graph.cy.getElementById(deviceSignature);
        currentNode.addClass('cySelectedNode');
        isSelectedNodeFound = true;
        graph.selectedDeviceSignature = deviceSignature;
      }
      else {
        graph.selectedDeviceSignature = null;
      }
    });

    return isSelectedNodeFound;
  }


  // Add a device node to the hyperlocal context graph
  function addDeviceNode(deviceSignature, device, graph) {
    let digitalTwin = graph.digitalTwins.get(deviceSignature) || {};
    let storyCovers = digitalTwin.storyCovers || [];
    let isExistingNode = (graph.cy.getElementById(deviceSignature).size() > 0);

    if(!isExistingNode) {
      graph.cy.add({ group: "nodes", data: { id: deviceSignature } });
    }

    let node = graph.cy.getElementById(deviceSignature);
    let nodeClass = isAnchor(device) ? 'cyAnchorNode' : 'cyDeviceNode';

    updateNodeStoryCover(node, storyCovers, deviceSignature);
    node.addClass(nodeClass);

    if(isAnchor(device)) {
      let position = { x: device.position[0],  y: device.position[1] };
      graph.options.layout.fixedNodeConstraint.push({ nodeId: deviceSignature,
                                                      position: position });
    }
    addDeviceEdges(deviceSignature, device, graph);
  }


  // Add device edges to the hyperlocal context graph
  function addDeviceEdges(deviceSignature, device, graph) {
    let edgeSignatures = [];

    if(device.hasOwnProperty('nearest')) {
      device.nearest.forEach((entry, index) => {
        if(index < graph.maxEdgesPerNode) {
          let peerSignature = entry.device;
          let edgeSignature = deviceSignature + '@' + peerSignature;
          let edge = graph.cy.getElementById(edgeSignature);
          let isExistingEdge = (edge.size() > 0);
          isExistingNode = (graph.cy.getElementById(peerSignature).size() > 0);
          edgeSignatures.push(edgeSignature);

          if(!isExistingNode) {
            graph.cy.add({ group: "nodes", data: { id: peerSignature } });
          }
          if(!isExistingEdge) {
            graph.cy.add({ group: "edges", data: { id: edgeSignature,
                                                   source: deviceSignature,
                                                   target: peerSignature,
                                                   name: entry.rssi + "dBm",
                                                   rssi: entry.rssi } });
          }
          else {
            edge.data({ name: entry.rssi + "dBm", rssi: entry.rssi });
          }
        }
      });
    }

    graph.cy.elements('edge[id^="' + deviceSignature + '@"]').forEach(edge => {
      let isPresent = edgeSignatures.includes(edge.id());
      if(!isPresent) { graph.cy.remove(edge); }
    });
  }


  // Update the image/title of the node from the given story covers
  function updateNodeStoryCover(node, storyCovers, deviceSignature) {
    if(Array.isArray(storyCovers) && (storyCovers.length > 0)) {
      let leadStoryCover = storyCovers[0];
      node.data('name', leadStoryCover.title || '');
      if(leadStoryCover.imageUrl) {
        node.data('image', leadStoryCover.imageUrl);
      }
    }
    else {
      node.data('name', deviceSignature);
    }
  }


  // Determine if the given device is an anchor with valid x and y position
  function isAnchor(device) {
    return device.hasOwnProperty('position') &&
           Array.isArray(device.position) &&
           (device.position.length >= 2) &&
           (typeof device.position[0] === 'number') &&
           (typeof device.position[1] === 'number');
  }


  // Fit the fixedNodeConstraint to the dimensions of the viewport
  function fitConstraintToViewport(graph) {
    if(graph.options.layout.fixedNodeConstraint.length <= 1) {
      return;
    }

    let viewportWidth = graph.cy.width();
    let viewportHeight = graph.cy.height();
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    graph.options.layout.fixedNodeConstraint.forEach((constraint) => {
      if(constraint.position.x < minX) { minX = constraint.position.x; }
      if(constraint.position.x > maxX) { maxX = constraint.position.x; }
      if(constraint.position.y < minY) { minY = constraint.position.y; }
      if(constraint.position.y > maxY) { maxY = constraint.position.y; }
    });

    let offsetX = 0 - minX;
    let offsetY = 0 - maxY;
    let ratioX = (maxX - minX) / viewportWidth;
    let ratioY = (minY - maxY) / viewportHeight;

    graph.options.layout.fixedNodeConstraint.forEach((constraint) => {
      constraint.position.x += offsetX;
      if(ratioX !== 0) { constraint.position.x /= ratioX; }
      constraint.position.y += offsetY;
      if(ratioY !== 0) { constraint.position.y /= ratioY; }
    });
  }


  // Handle a user tap on a specific node
  function handleNodeTap(event) {
    if(!event.target.id) { return; }

    let tappedDeviceSignature = event.target.id();

    selectNode(tappedDeviceSignature);
    eventCallbacks['tap'].forEach(callback => callback(tappedDeviceSignature));
  }


  // Update the layout
  function updateLayout(graph) {
    graph.layout.stop();
    graph.layout = graph.cy.elements().makeLayout(graph.options.layout);
    graph.layout.run();
  }


  // Register a callback for the given event
  let setEventCallback = function(event, callback) {
    let isValidEvent = event && eventCallbacks.hasOwnProperty(event);
    let isValidCallback = callback && (typeof callback === 'function');

    if(isValidEvent && isValidCallback) {
      eventCallbacks[event].push(callback);
    }
  }


  // Expose the following functions and variables
  return {
    init: init,
    spin: spin,
    updateDigitalTwin: updateDigitalTwin,
    selectNode: selectNode,
    on: setEventCallback
  }

}());