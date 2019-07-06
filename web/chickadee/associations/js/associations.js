/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


// Constants
const STATUS_OK = 200;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const MESSAGE_BAD_REQUEST = 'Bad Request [400].  An error likely occurred on the server.';
const MESSAGE_NOT_FOUND = 'Association for this device Not Found [404].';


// DOM elements
let jsonResponse = document.querySelector('#jsonResponse');
let identifier = document.querySelector('#identifier');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let associations = document.querySelector('#associations');
let url = document.querySelector('#url');
let tags = document.querySelector('#tags');
let directory = document.querySelector('#directory');
let position = document.querySelector('#position');


// Initialisation: GET the associations and display in DOM
getAssociations(window.location.href, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    let deviceId = Object.keys(response.associations)[0];
    let deviceAssociations = response.associations[deviceId];
    identifier.textContent = deviceId;
    url.textContent = deviceAssociations.url;
    tags.textContent = deviceAssociations.tags;
    directory.textContent = deviceAssociations.directory;
    position.textContent = deviceAssociations.position;
    identifier.hidden = false;
    associations.hidden = false;
  }
  else if(status === STATUS_BAD_REQUEST) {
    error.textContent = MESSAGE_BAD_REQUEST;
    error.hidden = false;
  }
  else if(status === STATUS_NOT_FOUND) {
    error.textContent = MESSAGE_NOT_FOUND;
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
