/**
 * Copyright reelyActive 2015-2019
 * We believe in an open Internet of Things
 */


// DOM elements
let jsonResponse = document.querySelector('#jsonResponse');
let identifier = document.querySelector('#identifier');
let url = document.querySelector('#url');
let tags = document.querySelector('#tags');
let directory = document.querySelector('#directory');
let position = document.querySelector('#position');


// Initialisation: GET the associations and display in DOM
getAssociations(window.location.href, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  // TODO: handle the case of Not Found and Bad Request
  let deviceId = Object.keys(response.associations)[0];
  let associations = response.associations[deviceId];
  identifier.textContent = deviceId;
  url.textContent = associations.url;
  tags.textContent = associations.tags;
  directory.textContent = associations.directory;
  position.textContent = associations.position;
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
