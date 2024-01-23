/**
 * Copyright reelyActive 2023-2024
 * We believe in an open Internet of Things
 */


let cuttlefishSpatem = (function() {

  // Internal constants
  const IDENTIFIER_TYPES = [
      'Unknown',
      'EUI-64',
      'EUI-48',
      'RND-48',
      'TID-96',
      'EPC-96',
      'UUID-128',
      'EURID-32'
  ];
  const DEFAULT_COORDINATE_PRECISION = 6;

  // Render a spatem
  function render(spatem, target, options) {
    options = options || {};
    let tbody = createElement('tbody');
    let table = createElement('table', 'table', tbody);

    if(spatem.hasOwnProperty('timestamp')) {
      let localeTimestamp = new Date(spatem['timestamp']).toLocaleTimeString();
      let captionIcon = createElement('i', 'fas fa-clock');
      let captionText = ' \u00a0' + localeTimestamp;
      let caption = createElement('caption', 'caption-top',
                                  [ captionIcon, captionText ]);
      table.appendChild(caption);
    }
    if(spatem.hasOwnProperty('deviceId') &&
       spatem.hasOwnProperty('deviceIdType') && !options.hideDeviceId) {
      let deviceId = spatem.deviceId + ' / ' +
                     IDENTIFIER_TYPES[spatem.deviceIdType];
      let icon = createElement('i', 'fas fa-wifi');
      let th = createElement('th', 'text-center', icon);
      let td = createElement('td', 'align-middle font-monospace', deviceId);
      let tr = createElement('tr', 'table-active', [ th, td ]);
      tbody.appendChild(tr);
    }
    if(spatem.hasOwnProperty('data') && Array.isArray(spatem.data.features)) {
      spatem.data.features.forEach((feature) => {
        let tr = renderFeatureAsRow(feature);

        if(tr) {
          tbody.appendChild(tr);
        }
      });
    }

    if(target) {
      target.replaceChildren(table);
    }

    return table;
  }

  // Render a feature as table row
  function renderFeatureAsRow(feature) {
    if(!feature.hasOwnProperty('geometry') ||
       !feature.geometry.hasOwnProperty('type') ||
       !Array.isArray(feature.geometry.coordinates)) {
      return null;
    }

    let icon;
    let content = feature.geometry.type;
    
    if(feature.geometry.type === 'Point') {
      icon = createElement('i', 'fas fa-map-pin');
      content = renderPoint(feature.geometry.coordinates);
    }
    else if(feature.geometry.type === 'Polygon') {
      icon = createElement('i', 'fas fa-draw-polygon');
      if(feature.hasOwnProperty('properties') &&
         feature.properties.hasOwnProperty('name')) {
        content = feature.properties.name;
      }
      else if(feature.hasOwnProperty('id')) {
        content = feature.id;
      }
    }

    let th = createElement('th', 'text-center', icon);
    let td = createElement('td', 'align-middle font-monospace', content);
    let tr = createElement('tr', null, [ th, td ]);

    return tr;
  }

  // Render a GeoJSON Point
  function renderPoint(coordinates) {
    let lis = [];

    coordinates.forEach((value, index) => {
      let displayValue = trimCoordinate(value, DEFAULT_COORDINATE_PRECISION);
      if(index < (coordinates.length - 1)) {
        displayValue += ',';
      }
      lis.push(createElement('li', 'list-inline-item', displayValue));
    });

    return createElement('ul', 'list-inline mb-0', lis);
  }

  // Trim the given coordinate for display
  function trimCoordinate(coordinate, maxPrecision) {
    let coordinateString = coordinate.toString();
    let elements = coordinateString.split('.');

    if((elements.length === 2) && (elements[1].length > maxPrecision)) {
      coordinateString = elements[0] + '.' +
                         elements[1].substring(0, maxPrecision);
    }
    return coordinateString;
  }

  // Create an element as specified, appending optional content as child(ren)
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

  // Expose the following functions and variables
  return {
    render: render
  }

}());