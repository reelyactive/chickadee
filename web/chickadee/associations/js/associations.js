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
const URL_ROUTE = '/url';
const TAGS_ROUTE = '/tags';
const DIRECTORY_ROUTE = '/directory';
const POSITION_ROUTE = '/position';


// DOM elements
let jsonResponse = document.querySelector('#jsonResponse');
let identifier = document.querySelector('#identifier');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');
let associations = document.querySelector('#associations');
let url = document.querySelector('#url');
let tags = document.querySelector('#tags');
let directory = document.querySelector('#directory');
let position = document.querySelector('#position');


// Other variables
let associationsUrl = window.location.href;
let deviceIdSignature;


// Initialisation: GET the associations and display in DOM
getAssociations(associationsUrl, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    deviceIdSignature = Object.keys(response.associations)[0];
    let deviceAssociations = response.associations[deviceIdSignature];
    identifier.textContent = deviceIdSignature;
    url.value = deviceAssociations.url || '';
    tags.value = deviceAssociations.tags || '';
    directory.value = deviceAssociations.directory || '';
    position.value = deviceAssociations.position || '';
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


// PUT the given association property
function putAssociationProperty(route, json, callback) {
  let url = associationsUrl + route;
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
  let url = associationsUrl + route;
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
    identifier.textContent = deviceIdSignature;
    url.value = deviceAssociations.url || '';
    tags.value = deviceAssociations.tags || '';
    directory.value = deviceAssociations.directory || '';
    position.value = deviceAssociations.position || '';
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
    if(route === URL_ROUTE) { url.value = '' }
    else if(route === TAGS_ROUTE) { tags.value = '' }
    else if(route === DIRECTORY_ROUTE) { directory.value = '' }
    else if(route === POSITION_ROUTE) { position.value = '' }
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


// Handle user request to copy the URL
function copyUrl() {
  url.select();
  document.execCommand('copy');
}

// Handle user request to copy the tags
function copyTags() {
  tags.select();
  document.execCommand('copy');
}

// Handle user request to copy the directory
function copyDirectory() {
  directory.select();
  document.execCommand('copy');
}

// Handle user request to copy the position
function copyPosition() {
  position.select();
  document.execCommand('copy');
}

// Handle user request to update the URL
function updateUrl() {
  let json = { url: url.value };
  putAssociationProperty(URL_ROUTE, json, handlePropertyUpdate);
}

// Handle user request to update the tags
function updateTags() {
  let json = { tags: tags.value.split(',') };
  putAssociationProperty(TAGS_ROUTE, json, handlePropertyUpdate);
}

// Handle user request to update the directory
function updateDirectory() {
  let json = { directory: directory.value };
  putAssociationProperty(DIRECTORY_ROUTE, json, handlePropertyUpdate);
}

// Handle user request to update the position
function updatePosition() {
  let positionArray = [];

  position.value.split(',').forEach(function(coordinate) {
    positionArray.push(parseFloat(coordinate));
  });
  let json = { position: positionArray };
  putAssociationProperty(POSITION_ROUTE, json, handlePropertyUpdate);
}

// Handle user request to delete the URL
function deleteUrl() {
  deleteAssociationProperty(URL_ROUTE, handlePropertyDelete);
}

// Handle user request to delete the tags
function deleteTags() {
  deleteAssociationProperty(TAGS_ROUTE, handlePropertyDelete);
}

// Handle user request to delete the directory
function deleteDirectory() {
  deleteAssociationProperty(DIRECTORY_ROUTE, handlePropertyDelete);
}

// Handle user request to delete the position
function deletePosition() {
  deleteAssociationProperty(POSITION_ROUTE, handlePropertyDelete);
}


// Event listeners
copyUrlButton.addEventListener('click', copyUrl);
copyTagsButton.addEventListener('click', copyTags);
copyDirectoryButton.addEventListener('click', copyDirectory);
copyPositionButton.addEventListener('click', copyPosition);
updateUrlButton.addEventListener('click', updateUrl);
updateTagsButton.addEventListener('click', updateTags);
updateDirectoryButton.addEventListener('click', updateDirectory);
updatePositionButton.addEventListener('click', updatePosition);
deleteUrlButton.addEventListener('click', deleteUrl);
deleteTagsButton.addEventListener('click', deleteTags);
deleteDirectoryButton.addEventListener('click', deleteDirectory);
deletePositionButton.addEventListener('click', deletePosition);
