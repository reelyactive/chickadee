/**
 * Copyright reelyActive 2022-2024
 * We believe in an open Internet of Things
 */


// Constants
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const MESSAGE_BAD_REQUEST = 'Bad Request [400].  An error likely occurred on the server.';
const MESSAGE_NOT_FOUND = 'Feature Not Found [404].';
const FEATURES_ROUTE = '/features';


// DOM elements
let returnButton = document.querySelector('#returnbutton');
let createButton = document.querySelector('#createbutton');
let jsonResponse = document.querySelector('#jsonResponse');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');


// Other variables
let queryUrl = window.location.href;
let featuresUrl = window.location.protocol + '//' +
                  window.location.hostname + ':' + window.location.port +
                  FEATURES_ROUTE;
let isRootQuery = false;


// Hide "return to /features" button when already querying /features
if((window.location.pathname.endsWith(FEATURES_ROUTE )) ||
   (window.location.pathname.endsWith(FEATURES_ROUTE + '/'))) {
  isRootQuery = true;
  returnButton.hidden = true;
}


// Initialisation: GET the features and display in DOM
getFeatures(queryUrl, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    updateFeatures(response.features);
    features.hidden = false;
  }
  else if(status === STATUS_BAD_REQUEST) {
    errorMessage.textContent = MESSAGE_BAD_REQUEST;
    error.hidden = false;
  }
  else if(status === STATUS_NOT_FOUND) {
    errorMessage.textContent = MESSAGE_NOT_FOUND;
    error.hidden = false;
    //createButton.hidden = false;     // TODO: reinstate when implemented
    createButton.onclick = putFeature; // TODO: change
  }
});


// GET the features
function getFeatures(url, callback) {
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


// Update the features in the DOM
function updateFeatures(featuresList) {
  let content = new DocumentFragment();

  for(const id in featuresList) {
    let feature = featuresList[id];
    let featureCard = createFeatureCard(id, feature, !isRootQuery);
    content.appendChild(featureCard);
  }

  features.replaceChildren(content);
}


// Create the feature card visualisation
function createFeatureCard(id, feature, isEditable) {
  let isEmptyFeature = (Object.keys(feature).length === 0);
  let featureUrl = featuresUrl + '/' + id;
  let headerIcon = createElement('i', 'fas fa-barcode');
  let headerText = createElement('span', 'font-monospace', ' ' + id);
  let header = createElement('div', 'card-header bg-dark text-white lead',
                             [ headerIcon, headerText ]);
  let body = createElement('div', 'card-body');
  let footerIcon = createElement('i', 'fas fa-link text-body-secondary');
  let footerText = createElement('a', 'text-truncate', featureUrl);
  let footer = createElement('small', 'card-footer',
                             [ footerIcon, ' ', footerText ]);
  let card = createElement('div', 'card mb-1', header);

  footerText.setAttribute('href', featureUrl);

  if(!isEmptyFeature || isEditable) {
    // TODO: improve the feature display, possibly with OpenLayers?
    let featureString = JSON.stringify(feature, null, 2);
    let featureProperties = createElement('pre', null, featureString);
    body.appendChild(featureProperties);
    card.appendChild(body);
  }

  card.appendChild(footer);

  return card;
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
