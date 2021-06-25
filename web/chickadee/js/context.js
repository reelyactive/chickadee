/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


// Constants
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const MESSAGE_BAD_REQUEST = 'Bad Request [400].  An error likely occurred on the server.';
const MESSAGE_NOT_FOUND = 'Context Not Found [404].';
const POLLING_INTERVAL_MILLISECONDS = 10000;
const CONTEXT_ROUTE = '/context';
const DEVICE_ROUTE = '/device';
const DIRECTORY_ROUTE = '/directory';
const TAG_ROUTE = '/tag';
const SIGNATURE_SEPARATOR = '/';
const IDENTIFIER_TYPES = [
    'Unknown',
    'EUI-64',
    'EUI-48',
    'RND-48'
];
const ASSOCIATION_ICON_CLASSES = {
    url: 'fas fa-link',
    tags: 'fas fa-tags',
    directory: 'fas fa-sitemap',
    position: 'fas fa-map-marked-alt'
};
const MAX_RSSI = -30;
const HLC_MIN_HEIGHT_PX = 480;
const HLC_UNUSABLE_HEIGHT_PX = 260;
const COSE_LAYOUT_OPTIONS = {
    name: "cose",
    animate: false,
    randomize: false,
    idealEdgeLength: function(edge) { return MAX_RSSI - edge.data('rssi'); },
    initialTemp: 40
};
const GRAPH_STYLE = [
    { selector: "node[type='device']",
      style: { "background-color": "#83b7d0", label: "data(name)",
               "font-size": "0.6em", "min-zoomed-font-size": "16px" } },
    { selector: "node[type='anchor']",
      style: { "background-color": "#0770a2", label: "data(name)",
               "font-size": "0.6em", "min-zoomed-font-size": "16px" } },
    { selector: "node[image]",
      style: { "background-image": "data(image)", "border-color": "#aec844",
               "background-fit": "cover cover", "border-width": "2px" } },
    { selector: "edge", style: { "curve-style": "haystack",
                                 "line-color": "#ddd", label: "data(name)",
                                 "text-rotation": "autorotate",
                                 color: "#5a5a5a", "font-size": "0.25em",
                                 "min-zoomed-font-size": "12px" } },
];


// DOM elements
let connection = document.querySelector('#connection');
let noUpdates = document.querySelector('#settingsNoUpdates');
let realTimeUpdates = document.querySelector('#settingsRealTimeUpdates');
let periodicUpdates = document.querySelector('#settingsPeriodicUpdates');
let jsonResponse = document.querySelector('#jsonResponse');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');
let context = document.querySelector('#context');
let humanTab = document.querySelector('#humantab');
let hlcTab = document.querySelector('#hlctab');
let machineTab = document.querySelector('#machinetab');


// Other variables
let queryUrl = window.location.href;
let contextUrl = window.location.protocol + '//' + window.location.hostname +
                 ':' + window.location.port + CONTEXT_ROUTE;
let isPollPending = false;
let isHyperlocalContextSelected = false;
let pollingInterval;
let machineReadableData;
let socket;
let cy;
let layout;


// Monitor each settings radio button
noUpdates.onchange = updateUpdates;
realTimeUpdates.onchange = updateUpdates;
periodicUpdates.onchange = updateUpdates;


// Render/remove the hyperlocal context graph upon tab selection
humanTab.onclick = unselectHyperlocalContext;
hlcTab.onclick = selectHyperlocalContext;
machineTab.onclick = unselectHyperlocalContext;


// Initialisation: poll the devices once and display the result
pollAndDisplay();


// GET the devices and display in DOM
function pollAndDisplay() {
  if(!isPollPending) {
    isPollPending = true;
    loading.hidden = false;
    error.hidden = true;
    context.hidden = true;

    getContext(queryUrl, function(status, response) {
      machineReadableData = response;
      jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);
      loading.hidden = true;
      isPollPending = false;

      if(status === STATUS_OK) {
        let isSpecificDevice = window.location.pathname.includes(DEVICE_ROUTE);
        updateDevices(response.devices);
        context.hidden = false;

        if(isSpecificDevice) {
          realTimeUpdates.disabled = false;
        }
        if(isHyperlocalContextSelected) {
          renderHyperlocalContext();
        }
      }
      else if(status === STATUS_BAD_REQUEST) {
        errorMessage.textContent = MESSAGE_BAD_REQUEST;
        error.hidden = false;
      }
      else if(status === STATUS_NOT_FOUND) {
        errorMessage.textContent = MESSAGE_NOT_FOUND;
        error.hidden = false;
      }
    });
  }
}


// GET the context
function getContext(url, callback) {
  let httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
      return callback(httpRequest.status,
                      JSON.parse(httpRequest.responseText));
    }
  };
  httpRequest.open('GET', url);
  httpRequest.setRequestHeader('Accept', 'application/json');
  httpRequest.send();
}


// Update the devices in the DOM
function updateDevices(devicesList) {
  let content = new DocumentFragment();

  for(const deviceSignature in devicesList) {
    let device = devicesList[deviceSignature];
    let deviceCard = createDeviceCard(deviceSignature, device);
    content.appendChild(deviceCard);
  }

  context.replaceChildren(content);
}


// Create the device card visualisation
function createDeviceCard(signature, device) {
  let isEmptyDevice = (Object.keys(device).length === 0);
  let deviceUrl = contextUrl + DEVICE_ROUTE + '/' + signature;
  let headerIcon = createElement('i', 'fas fa-barcode');
  let headerText = createElement('span', 'font-monospace', ' ' + signature);
  let header = createElement('div', 'card-header bg-dark text-white lead',
                             [ headerIcon, headerText ]);
  let body = createElement('div', 'card-body');
  let footerIcon = createElement('i', 'fas fa-link text-muted');
  let footerText = createElement('a', 'text-truncate', deviceUrl);
  let footer = createElement('small', 'card-footer',
                             [ footerIcon, ' ', footerText ]);
  let card = createElement('div', 'card mb-1', header);

  footerText.setAttribute('href', deviceUrl);

  if(!isEmptyDevice) {
    let accordion = createDeviceAccordion(device, signature);
    body.appendChild(accordion);
    card.appendChild(body);
  }

  card.appendChild(footer);

  return card;
}


// Create the device accordion visualisation
function createDeviceAccordion(device, signature) {
  let idSignature = signature.replace('/', '');
  let accordionId = 'deviceAccordion' + idSignature;
  let accordion = createElement('div', 'accordion accordion-flush');
  accordion.setAttribute('id', accordionId);

  if(device.hasOwnProperty('nearest')) {
    let nearestContent = createNearestContent(device.nearest);
    let nearestIcon = createElement('i', 'fas fa-satellite-dish');
    let nearestTitle = createElement('span', null,
                                     [ nearestIcon, '\u00a0 nearest' ]);
    let nearestItem = createAccordionItem('nearestid', accordionId,
                                          nearestTitle, nearestContent);
    accordion.appendChild(nearestItem);
  }
  if(device.hasOwnProperty('dynamb')) {
    let dynambContent = cuttlefishDynamb.render(device.dynamb);
    let dynambIcon = createElement('i', 'fas fa-tachometer-alt');
    let dynambTitle = createElement('span', null,
                                    [ dynambIcon, '\u00a0 dynamb' ]);
    let dynambItem = createAccordionItem('dynamb', accordionId, dynambTitle,
                                         dynambContent,
                                         'dynambcontainer' + idSignature);
    accordion.appendChild(dynambItem);
  }
  if(device.hasOwnProperty('statid')) {
    let statidContent = createStatidContent(device.statid);
    let statidIcon = createElement('i', 'fas fa-id-card');
    let statidTitle = createElement('span', null,
                                    [ statidIcon, '\u00a0 statid' ]);
    let statidItem = createAccordionItem('statid', accordionId, statidTitle,
                                         statidContent);
    accordion.appendChild(statidItem);
  }
  if(device.hasOwnProperty('url') || device.hasOwnProperty('tags') ||
     device.hasOwnProperty('directory') || device.hasOwnProperty('position')) {
    let associationsContent = createAssociationsContent(device);
    let associationsIcon = createElement('i', 'fas fa-info-circle');
    let associationsTitle = createElement('span', null,
                                          [ associationsIcon,
                                            '\u00a0 associations' ]);
    let associationsItem = createAccordionItem('associations', accordionId,
                                               associationsTitle,
                                               associationsContent);
    accordion.appendChild(associationsItem);
  }

  return accordion;
}


// Create the nearest visualisation
function createNearestContent(nearest) {
  let tbody = createElement('tbody');

  nearest.forEach(function(item, index) {
    let rowClass = (index === 0) ? 'table-success' : null;
    let device = createElement('td', 'font-monospace', item.device);
    let rssi = createElement('td', 'font-monospace', item.rssi + ' dBm');
    let row = createElement('tr', rowClass, [ device, rssi ]);
    tbody.appendChild(row);
  });

  return createElement('table', 'table table-hover mb-0', tbody);
}


// Create the statid visualisation
function createStatidContent(statid) {
  let tbody = createElement('tbody');

  for(const property in statid) {
    let th = createElement('th', null, property);
    let td = createElement('td', 'font-monospace', statid[property].toString());
    let row = createElement('tr', null, [ th, td ]);
    tbody.appendChild(row);
  }

  return createElement('table', 'table table-hover mb-0', tbody);
}


// Create the associations visualisation
function createAssociationsContent(device) {
  let tbody = createElement('tbody');

  for(const property in device) {
    if((property === 'url') || (property === 'tags') ||
       (property === 'directory') || (property === 'position')) {
      let icon = createElement('i', ASSOCIATION_ICON_CLASSES[property]);
      let th = createElement('th', null, icon);
      let td = createElement('td', 'font-monospace',
                             device[property].toString());
      let row = createElement('tr', null, [ th, td ]);
      tbody.appendChild(row);
    }
  }

  return createElement('table', 'table table-hover mb-0', tbody);
}


// Create an accordion item
function createAccordionItem(name, parentName, title, content, contentId) {
  let accordionCollapseId = name + 'Collapse';
  let accordionButton = createElement('button', 'accordion-button', title);
  let accordionHeader = createElement('h2', 'accordion-header',
                                      accordionButton);
  let accordionBody = createElement('div', 'accordion-body', content);
  let accordionCollapse = createElement('div',
                                        'accordion-collapse collapse show',
                                        accordionBody);
  let accordionItem = createElement('div', 'accordion-item overflow-hidden',
                                    [ accordionHeader, accordionCollapse ]);

  accordionButton.setAttribute('type', 'button');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute('data-bs-target', '#' + accordionCollapseId);
  accordionCollapse.setAttribute('id', accordionCollapseId);
  accordionCollapse.setAttribute('data-bs-parent', '#' + parentName);

  if(contentId) {
    accordionBody.setAttribute('id', contentId);
  }

  return accordionItem;
}


// Create an element as specified
function createElement(elementName, classNames, content) {
  let element = document.createElement(elementName);

  if(classNames) {
    element.setAttribute('class', classNames);
  }

  if((content instanceof Element) || (content instanceof DocumentFragment)) {
    element.appendChild(content);
  }
  else if(Array.isArray(content)) {
    content.forEach(function(item) {
      if((item instanceof Element) || (item instanceof DocumentFragment)) {
        element.appendChild(item);
      }
      else {
        element.appendChild(document.createTextNode(item));
      }
    });
  }
  else if(content) {
    element.appendChild(document.createTextNode(content));
  }

  return element;
}


// Create and manage a socket.io connection
function createSocket() {
  socket = io(window.location.pathname);

  socket.on('connect', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-success'));
  });

  socket.on('devices', function(devices) {
    machineReadableData.devices = devices;
    jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);
    updateDevices(devices);

    if(isHyperlocalContextSelected) {
      renderHyperlocalContext();
    }
  });

  socket.on('dynamb', function(dynamb) {
    let signature = dynamb.deviceId + SIGNATURE_SEPARATOR + dynamb.deviceIdType;
    let idSignature = dynamb.deviceId + dynamb.deviceIdType;
    let container = document.querySelector('#dynambcontainer' + idSignature);

    if(container) {
      let content = cuttlefishDynamb.render(dynamb);
      machineReadableData.devices[signature].dynamb = dynamb;
      jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);
      container.replaceChildren(content);
    }
  });

  socket.on('connect_error', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-danger'));
  });

  socket.on('disconnect', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-warning'));
  });
}


// Unselect the hyperlocal context graph tab
function unselectHyperlocalContext() {
  isHyperlocalContextSelected = false;

  let container = document.getElementById('cy-container');

  container.setAttribute('style', 'height: 0px');
}


// Select the hyperlocal context graph tab
function selectHyperlocalContext() {
  isHyperlocalContextSelected = true;

  let container = document.getElementById('cy-container');
  let height = Math.max(window.innerHeight - HLC_UNUSABLE_HEIGHT_PX,
                        HLC_MIN_HEIGHT_PX) + 'px';
  container.setAttribute('style', 'height:' + height);

  renderHyperlocalContext();
}


// Update the update method
function updateUpdates(event) {
  if(noUpdates.checked) {
    connection.hidden = true;
    if(socket) { socket.disconnect(); }
    clearInterval(pollingInterval);
  }

  if(realTimeUpdates.checked) { 
    connection.hidden = false;
    clearInterval(pollingInterval);
    createSocket();
  }

  if(periodicUpdates.checked) {
    connection.hidden = true;
    if(socket) { socket.disconnect(); }
    pollAndDisplay();
    pollingInterval = setInterval(pollAndDisplay,
                                  POLLING_INTERVAL_MILLISECONDS);
  }
}


// Add a device node to the hyperlocal context graph
function addDeviceNode(deviceSignature, device) {
  let name = determineDeviceName(device);
  let isAnchor = device.hasOwnProperty('position');
  let type = isAnchor ? 'anchor' : 'device';
  let isExistingNode = (cy.getElementById(deviceSignature).size() > 0);

  if(!isExistingNode) {
    cy.add({ group: "nodes", renderedPosition: { x: 0, y: 0 },
             data: { id: deviceSignature, type: type, name: name } });
  }
  else {
    cy.getElementById(deviceSignature).data('name', name);
    cy.getElementById(deviceSignature).data('type', type);
  }

  if(device.hasOwnProperty('nearest')) {
    device.nearest.forEach(function(entry) {
      let peerSignature = entry.device;
      let edgeSignature = deviceSignature + '@' + peerSignature;
      let isExistingEdge = (cy.getElementById(edgeSignature).size() > 0);
      isExistingNode = (cy.getElementById(peerSignature).size() > 0);

      if(!isExistingNode) {
        cy.add({ group: "nodes", data: { id: peerSignature, type: "device" } });
      }
      if(!isExistingEdge) {
        cy.add({ group: "edges", data: { id: edgeSignature,
                                         source: deviceSignature,
                                         target: peerSignature,
                                         name: entry.rssi + "dBm",
                                         rssi: entry.rssi } });
      }
    });
  }
}


// Determine the name of the device, if any
function determineDeviceName(device) {
  if(device.hasOwnProperty('directory')) {
    return device.directory;
  }

  if(device.hasOwnProperty('statid') && device.statid.hasOwnProperty('name')) {
    return device.statid.name;
  }

  if(device.hasOwnProperty('tags') && Array.isArray(device.tags)) {
    return device.tags[0];
  }

  if(device.hasOwnProperty('position')) {
    return device.position;
  }

  return '';
}


// Unselect the hyperlocal context graph tab
function unselectHyperlocalContext() {
  isHyperlocalContextSelected = false;

  let container = document.getElementById('cy-container');

  container.setAttribute('style', 'height: 0px');
}


// Select the hyperlocal context graph tab
function selectHyperlocalContext() {
  isHyperlocalContextSelected = true;

  let container = document.getElementById('cy-container');
  let height = Math.max(window.innerHeight - HLC_UNUSABLE_HEIGHT_PX,
                        HLC_MIN_HEIGHT_PX) + 'px';
  container.setAttribute('style', 'height:' + height);

  renderHyperlocalContext();
}


// Render the hyperlocal context graph
function renderHyperlocalContext() {
  let options = {
      container: document.getElementById('cy'),
      layout: COSE_LAYOUT_OPTIONS,
      style: GRAPH_STYLE
  };
  let layoutName = 'cose';

  cy = cytoscape(options);
  layout = cy.layout({ name: layoutName, cy: cy });

  if(machineReadableData) {
    let devicesList = machineReadableData.devices || {};

    for(const deviceSignature in devicesList) {
      let device = devicesList[deviceSignature];

      addDeviceNode(deviceSignature, device);
    }
  }

  layout.stop();
  layout = cy.elements().makeLayout(options.layout);
  layout.run();
}