/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var STATUS_OK = "ok";
var STATUS_CREATED = "created";
var STATUS_NOTFOUND = "notFound";
var STATUS_BADREQUEST = "badRequest";
var STATUS_NOTIMPLEMENTED = "notImplemented";
var CODE_OK = 200;
var CODE_CREATED = 201;
var CODE_NOTFOUND = 404;
var CODE_BADREQUEST = 400;
var CODE_NOTIMPLEMENTED = 501;


/**
 * Prepares the JSON for an API query response which is successful
 * @param {String} status String representing the status message
 */
function prepareResponse(status) {
  var response = {};
  prepareMeta(response, status);
  return response;
};


/**
 * Prepares the JSON for an API query response which is unsuccessful
 * @param {String} status String representing the status message
 */
function prepareFailureResponse(status) {
  var response = {};
  prepareMeta(response, status);
  return response;
};


/**
 * Prepares and adds the _meta to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {String} status String representing the status message
 */
function prepareMeta(response, status) {
  switch(status) {
    case STATUS_OK:
      response._meta = { "message": STATUS_OK,
                         "statusCode": CODE_OK };
      break;
    case STATUS_CREATED:
      response._meta = { "message": STATUS_CREATED,
                         "statusCode": CODE_CREATED };
      break;
    case STATUS_NOTFOUND:
      response._meta = { "message": STATUS_NOTFOUND,
                         "statusCode": CODE_NOTFOUND };
      break; 
    case STATUS_NOTIMPLEMENTED:
      response._meta = { "message": STATUS_NOTIMPLEMENTED,
                         "statusCode": CODE_NOTIMPLEMENTED };
      break;  
    default:
      response._meta = { "message": STATUS_BADREQUEST,
                         "statusCode": CODE_BADREQUEST }; 
  }
};


module.exports.prepareResponse = prepareResponse;
module.exports.prepareFailureResponse = prepareFailureResponse;
