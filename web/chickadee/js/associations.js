/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


// Constants
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const MESSAGE_BAD_REQUEST = 'Bad Request [400].  An error likely occurred on the server.';
const MESSAGE_NOT_FOUND = 'Association for this device Not Found [404].';
const ASSOCIATIONS_ROUTE = '/associations';
const URL_ROUTE = '/url';
const TAGS_ROUTE = '/tags';
const DIRECTORY_ROUTE = '/directory';
const POSITION_ROUTE = '/position';


// DOM elements
let returnButton = document.querySelector('#returnbutton');
let jsonResponse = document.querySelector('#jsonResponse');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');


// Other variables
let queryUrl = window.location.href;
let associationsUrl = window.location.protocol + '//' +
                      window.location.hostname + ':' + window.location.port +
                      ASSOCIATIONS_ROUTE;


// Hide "return to /associations" button when already querying /associations
if((window.location.pathname.endsWith(ASSOCIATIONS_ROUTE )) ||
   (window.location.pathname.endsWith(ASSOCIATIONS_ROUTE + '/'))) {
  returnButton.hidden = true;
}


// Initialisation: GET the associations and display in DOM
getAssociations(queryUrl, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    updateAssociations(response.associations);
    associations.hidden = false;
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


// GET the associations
function getAssociations(url, callback) {
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


// Update the associations in the DOM
function updateAssociations(associationsList) {
  let content = new DocumentFragment();

  for(const signature in associationsList) {
    let association = associationsList[signature];
    let associationCard = createAssociationCard(signature, association);
    content.appendChild(associationCard);
  }

  associations.replaceChildren(content);
}


// Create the association card visualisation
function createAssociationCard(signature, association) {
  let isEmptyAssociation = (Object.keys(association).length === 0);
  let associationUrl = associationsUrl + '/' + signature;
  let headerIcon = createElement('i', 'fas fa-barcode');
  let headerText = createElement('span', 'font-monospace', ' ' + signature);
  let header = createElement('div', 'card-header bg-dark text-white lead',
                             [ headerIcon, headerText ]);
  let body = createElement('div', 'card-body');
  let footerIcon = createElement('i', 'fas fa-link text-muted');
  let footerText = createElement('a', 'text-truncate', associationUrl);
  let footer = createElement('small', 'card-footer',
                             [ footerIcon, ' ', footerText ]);
  let card = createElement('div', 'card mb-1', header);

  footerText.setAttribute('href', associationUrl);

  if(!isEmptyAssociation) {
    body.appendChild(createPropertyForm('url', 'fas fa-link', 'url',
                                        association.url));
    body.appendChild(createPropertyForm('tags', 'fas fa-tags', 'text',
                                        association.tags));
    body.appendChild(createPropertyForm('directory', 'fas fa-sitemap', 'text',
                                        association.directory));
    body.appendChild(createPropertyForm('position', 'fas fa-map-marked-alt',
                                        'text', association.position));
    card.appendChild(body);
  }

  card.appendChild(footer);

  return card;
}


// Create association property form
function createPropertyForm(property, iconClass, inputType, value) {
  let icon = createElement('i', iconClass);
  let inputGroupText = createElement('span', 'input-group-text',
                                     [ icon, '\u00a0 ' + property ]);
  let input = createElement('input', 'form-control');
  let copyIcon = createElement('i', 'fas fa-copy');
  let copyButton = createElement('button', 'btn btn-outline-info', copyIcon); 
  let updateIcon = createElement('i', 'fas fa-save');
  let updateButton = createElement('button', 'btn btn-primary', updateIcon);
  let deleteIcon = createElement('i', 'fas fa-trash');
  let deleteButton = createElement('button', 'btn btn-dark', deleteIcon);

  let inputGroup = createElement('div', 'input-group',
                                 [ inputGroupText, input, copyButton,
                                   updateButton, deleteButton ]);
  let form = createElement('form', 'my-2', inputGroup);

  input.id = property;
  input.value = value || '';
  input.setAttribute('type', inputType);
  copyButton.setAttribute('type', 'button');
  copyButton.onclick = copyActions[property];
  updateButton.setAttribute('type', 'button');
  updateButton.onclick = updateActions[property];
  deleteButton.setAttribute('type', 'button');
  deleteButton.onclick = deleteActions[property];
  form.setAttribute('onsubmit', 'return false;');

  return form;
}


// PUT the given association property
function putAssociationProperty(route, json, callback) {
  let url = queryUrl + route;
  let httpRequest = new XMLHttpRequest();
  let jsonString = JSON.stringify(json);

  error.hidden = true;
  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
      if((httpRequest.status === STATUS_OK) ||
         (httpRequest.status === STATUS_CREATED)) {
        return callback(httpRequest.status,
                        JSON.parse(httpRequest.responseText));
      }
      else {
        return callback(httpRequest.status);
      }
    }
  };
  httpRequest.open('PUT', url);
  httpRequest.setRequestHeader('Content-Type', 'application/json');
  httpRequest.setRequestHeader('Accept', 'application/json');
  httpRequest.send(jsonString);
}


// DELETE the given association property
function deleteAssociationProperty(route, callback) {
  let url = queryUrl + route;
  let httpRequest = new XMLHttpRequest();

  error.hidden = true;
  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
      if(httpRequest.status === STATUS_OK) {
        return callback(httpRequest.status, route,
                        JSON.parse(httpRequest.responseText));
      }
      else {
        return callback(httpRequest.status, route);
      }
    }
  };
  httpRequest.open('DELETE', url);
  httpRequest.setRequestHeader('Accept', 'application/json');
  httpRequest.send();
}


// Handle the update of an association property
function handlePropertyUpdate(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);

  if(status === STATUS_OK) {
    deviceIdSignature = Object.keys(response.associations)[0];
    let deviceAssociations = response.associations[deviceIdSignature];
    document.querySelector('#url').value = deviceAssociations.url || '';
    document.querySelector('#tags').value = deviceAssociations.tags || '';
    document.querySelector('#directory').value = deviceAssociations.directory
                                                 || '';
    document.querySelector('#position').value = deviceAssociations.position ||
                                                 '';
  }
  else if(status === STATUS_BAD_REQUEST) {
    errorMessage.textContent = MESSAGE_BAD_REQUEST;
    error.hidden = false;
  }
  else if(status === STATUS_NOT_FOUND) {
    errorMessage.textContent = MESSAGE_NOT_FOUND;
    error.hidden = false;
  }
}


// Handle the deletion of an association property
function handlePropertyDelete(status, route, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);

  if(status === STATUS_OK) {
    if(route === URL_ROUTE) {
      document.querySelector('#url').value = '';
    }
    else if(route === TAGS_ROUTE) {
      document.querySelector('#tags').value = '';
    }
    else if(route === DIRECTORY_ROUTE) {
      document.querySelector('#directory').value = ''
    }
    else if(route === POSITION_ROUTE) {
      document.querySelector('#position').value = ''
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
}


// Copy functions (by property)
let copyActions = {
    "url":
       function() {
         document.querySelector('#url').select();
         document.execCommand('copy');
       },
    "tags":
       function() {
         document.querySelector('#tags').select();
         document.execCommand('copy');
       },
    "directory":
       function() {
         document.querySelector('#directory').select();
         document.execCommand('copy');
       },
    "position":
       function() {
         document.querySelector('#position').select();
         document.execCommand('copy');
       }
};


// Update functions (by property)
let updateActions = {
    "url":
       function() {
         let json = { url: document.querySelector('#url').value };
         putAssociationProperty(URL_ROUTE, json, handlePropertyUpdate);
       },
    "tags":
       function() {
         let json = { tags: document.querySelector('#tags').value.split(',') };
         putAssociationProperty(TAGS_ROUTE, json, handlePropertyUpdate);
       },
    "directory":
       function() {
         let json = { directory: document.querySelector('#directory').value };
         putAssociationProperty(DIRECTORY_ROUTE, json, handlePropertyUpdate);
       },
    "position":
       function() {
         let positionArray = [];
         let position = document.querySelector('#position');

         position.value.split(',').forEach(function(coordinate) {
           positionArray.push(parseFloat(coordinate));
         });

         let json = { position: positionArray };
         putAssociationProperty(POSITION_ROUTE, json, handlePropertyUpdate);
       }
};


// Delete functions (by property)
let deleteActions = {
    "url":
       function() {
         deleteAssociationProperty(URL_ROUTE, handlePropertyDelete);
       },
    "tags":
       function() {
         deleteAssociationProperty(TAGS_ROUTE, handlePropertyDelete);
       },
    "directory":
       function() {
         deleteAssociationProperty(DIRECTORY_ROUTE, handlePropertyDelete);
       },
    "position":
       function() {
         deleteAssociationProperty(POSITION_ROUTE, handlePropertyDelete);
       }
};


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
