/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


let cuttlefishDynamb = (function() {

  // Internal constants
  const IDENTIFIER_TYPES = [
      'Unknown',
      'EUI-64',
      'EUI-48',
      'RND-48'
  ];
  const AXIS_NAMES = [ 'x', 'y', 'z' ];

  // Standard data properties (property: {icon, suffix}) in alphabetical order
  const STANDARD_DATA_PROPERTIES = {
      acceleration: { icon: "fas fa-rocket", suffix: "g",
                      transform: "progressXYZ" },
      batteryPercentage: { icon: "fas fa-battery-half", suffix: " %",
                           transform: "progressPercentage" },
      batteryVoltage: { icon: "fas fa-battery-half", suffix: " V",
                        transform: "toFixed(2)" },
      deviceId: { icon: "fas fa-wifi", suffix: "", transform: "text" },
      interactionDigest: { icon: "fas fa-history", suffix: "interactions",
                           transform: "tableDigest" },
      nearest: { icon: "fas fa-people-arrows", suffix: "dBm",
                 transform: "tableNearest" },
      relativeHumidity: { icon: "fas fa-water", suffix: " %",
                          transform: "progressPercentage" },
      temperature: { icon: "fas fa-thermometer-half", suffix: " \u2103",
                     transform: "toFixed(2)" },
      timestamp: { icon: "fas fa-clock", suffix: "", transform: "timeOfDay" },
      uptime: { icon: "fas fa-stopwatch", suffix: " ms" }
  };

  // Render a dynamb
  function render(dynamb, target, options) {
    let tbody = createElement('tbody');
    let table = createElement('table', 'table', tbody);

    if(dynamb.hasOwnProperty('timestamp')) {
      let localeTimestamp = new Date(dynamb['timestamp']).toLocaleTimeString();
      let captionIcon = createElement('i', 'fas fa-clock');
      let captionText = ' \u00a0' + localeTimestamp;
      let caption = createElement('caption', 'caption-top',
                                  [ captionIcon, captionText ]);
      table.appendChild(caption);
    }
    if(dynamb.hasOwnProperty('deviceId') &&
       dynamb.hasOwnProperty('deviceIdType')) {
      let deviceId = dynamb.deviceId + ' / ' +
                     IDENTIFIER_TYPES[dynamb.deviceIdType];
      let tr = renderAsRow('deviceId', deviceId);
      tbody.appendChild(tr);
    }

    for(const property in dynamb) {
      if((property !== 'timestamp') && (property !== 'deviceId') &&
         (property !== 'deviceIdType')) {
        let tr = renderAsRow(property, dynamb[property]);

        if(tr) {
          tbody.appendChild(tr);
        }
      }
    }

    if(target) {
      target.replaceChildren(table);
    }

    return table;
  }

  // Render a table row
  function renderAsRow(property, data) {
    let isKnownProperty = STANDARD_DATA_PROPERTIES.hasOwnProperty(property);

    if(isKnownProperty) {
      let dataRender = STANDARD_DATA_PROPERTIES[property];
      let content = renderAsTransform(dataRender.transform, data,
                                      dataRender.suffix);
      let icon = createElement('i', dataRender.icon);
      let th = createElement('th', 'text-center', icon);
      let td = createElement('td', 'align-middle', content);
      let tr = createElement('tr', null, [ th, td ]);

      return tr;
    }

    return null; // TODO: handle unknown property
  }

  // Render property as per given transform
  function renderAsTransform(transform, data, suffix) {
    suffix = suffix || '';

    switch(transform) {
      case 'progressPercentage':
        return renderProgress(data, 100, 0, '%');
      case 'progressXYZ':
        return renderProgressXYZ(data, suffix);
      case 'toFixed(2)':
        return data.toFixed(2) + suffix;
      case 'tableNearest':
        return renderTableDevices(data, 'rssi', suffix);
      case 'tableDigest':
        return renderTableDevices(data.interactions, 'count', suffix,
                                  data.timestamp);
      default:
        return data.toString() + suffix;
    }
  }

  // Render a progress bar
  function renderProgress(value, maxValue, decimalDigits, suffix) {
    decimalDigits = decimalDigits || 0;
    suffix = suffix || '';

    let isPositive = (value >= 0);
    let valueString = value.toFixed(decimalDigits) + suffix;
    let widthPercentage = (100 * Math.abs(value) / maxValue).toFixed(0) + '%';
    let progressBar = createElement('div', 'progress-bar', valueString);
    let progressClass = isPositive ? 'progress' : 'progress flex-row-reverse';
    let progress = createElement('div', progressClass, progressBar);

    progressBar.setAttribute('style', 'width: ' + widthPercentage);

    return progress;
  }

  // Render a progress XYZ array
  function renderProgressXYZ(data, suffix) {
    suffix = suffix || '';

    let maxValue = Math.max(Math.max(...data), Math.abs(Math.min(...data)));
    let magnitude = 0;
    let tbody = createElement('tbody', 'align-middle');
    let table = createElement('table', 'table table-borderless', tbody);

    data.forEach(function(value, index) {
      let progressNeg = renderProgress(Math.min(value, 0), maxValue, 2, suffix);
      let progressPos = renderProgress(Math.max(value, 0), maxValue, 2, suffix);
      let tdNeg = createElement('td', null, progressNeg);
      let th = createElement('th', 'text-center small', AXIS_NAMES[index]);
      let tdPos = createElement('td', null, progressPos);
      let tr = createElement('tr', null, [ tdNeg, th, tdPos ]);
      tbody.appendChild(tr);
      magnitude += (value * value);
    });

    magnitude = Math.sqrt(magnitude).toFixed(2);
    let caption = createElement('caption', null, magnitude + suffix);
    table.appendChild(caption);

    return table;
  }

  // Render a device array in tabular format
  function renderTableDevices(data, property, suffix, timestamp) {
    let tbody = createElement('tbody', 'align-middle font-monospace');
    let table = createElement('table',
                              'table table-hover table-borderless mb-0', tbody);

    data.forEach(function(entry, index) {
      let tdInstance = createElement('td', null, entry.deviceId);
      let tdValue = createElement('td', null, entry[property] + ' ' + suffix);
      let trClass = (index === 0) ? 'table-success' : null;
      let tr = createElement('tr', trClass, [ tdInstance, tdValue ]);

      tbody.appendChild(tr);
    });

    if(timestamp) {
      let captionTime = new Date(timestamp).toLocaleTimeString();
      let captionIcon = createElement('i', 'fas fa-clock');
      let isUptime = (timestamp < (Date.now() / 10000));
      if(isUptime) {
        let hours = Math.floor(timestamp / 3600);
        let minutes = Math.floor((timestamp % 3600) / 60);
        let seconds = (timestamp % 3600) % 60;
        captionTime = '\u00a0 ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
        captionIcon = createElement('i', 'fas fa-stopwatch');
      }
      let caption = createElement('caption', null,
                                  [ captionIcon, captionTime ]);
      table.appendChild(caption);
    }

    return table;
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