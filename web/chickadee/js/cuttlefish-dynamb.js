/**
 * Copyright reelyActive 2021-2023
 * We believe in an open Internet of Things
 */


let cuttlefishDynamb = (function() {

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
  const AXIS_NAMES = [ 'x', 'y', 'z' ];
  const MS_IN_YEAR = 31536000000;
  const MS_IN_DAY = 86400000;
  const MS_IN_HOUR = 3600000;
  const MS_IN_MINUTE = 60000;
  const MS_IN_SECOND = 1000;

  // Standard data properties (property: {icon, suffix}) in alphabetical order
  const STANDARD_DATA_PROPERTIES = {
      acceleration: { icon: "fas fa-rocket", suffix: "g",
                      transform: "progressXYZ" },
      amperage: { icon: "fas fa-arrow-circle-up", suffix: " A",
                  transform: "toFixed(2)" },
      amperages: { icon: "fas fa-arrow-circle-up", suffix: " A",
                   transform: "toFixedArray(2)" },
      angleOfRotation: { icon: "fas fa-redo", transform: "rotationDegrees" },
      batteryPercentage: { icon: "fas fa-battery-half", suffix: " %",
                           transform: "progressPercentage" },
      batteryVoltage: { icon: "fas fa-battery-half", suffix: " V",
                        transform: "toFixed(2)" },
      deviceId: { icon: "fas fa-wifi", suffix: "", transform: "text" },
      distance: { icon: "fas fa-expand-alt", suffix: " m",
                  transform: "toFixed(2)" },
      elevation: { icon: "fas fa-layer-group", suffix: " m",
                   transform: "toFixed(2)" },
      heading: { icon: "fas fa-compass", transform: "rotationDegrees" },
      heartRate: { icon: "fas fa-heartbeat", suffix: " bpm",
                   transform: "toFixed(0)" },
      illuminance: { icon: "fas fa-sun", suffix: " lx",
                     transform: "toFixed(0)" },
      interactionDigest: { icon: "fas fa-history", suffix: "interactions",
                           transform: "tableDigest" },
      isButtonPressed: { icon: "fas fa-hand-pointer", suffix: "",
                         transform: "booleanArray" },
      isContactDetected: { icon: "fas fa-compress-alt", suffix: "",
                           transform: "booleanArray" },
      isLiquidDetected: { icon: "fas fa-tint", suffix: "",
                          transform: "booleanArray" },
      isMotionDetected: { icon: "fas fa-walking", suffix: "",
                          transform: "booleanArray" },
      magneticField: { icon: "fas fa-magnet", suffix: " G",
                       transform: "progressXYZ" },
      nearest: { icon: "fas fa-people-arrows", suffix: "dBm",
                 transform: "tableNearest" },
      position: { icon: "fas fa-map-pin", suffix: "", transform: "position" },
      pressure: { icon: "fas fa-cloud", suffix: " Pa",
                  transform: "toFixed(0)" },
      pressures: { icon: "fas fa-cloud", suffix: " Pa",
                   transform: "toFixedArray(0)" },
      relativeHumidity: { icon: "fas fa-water", suffix: " %",
                          transform: "progressPercentage" },
      speed: { icon: "fas fa-tachometer-alt", suffix: " m/s",
               transform: "toFixed(2)" },
      temperature: { icon: "fas fa-thermometer-half", suffix: " \u2103",
                     transform: "toFixed(2)" },
      temperatures: { icon: "fas fa-thermometer-half", suffix: " \u2103",
                      transform: "numberArray(2)" },
      timestamp: { icon: "fas fa-clock", suffix: "", transform: "timeOfDay" },
      txCount: { icon: "fas fa-satellite-dish", transform: "localeString",
                 suffix: " Tx" },
      unicodeCodePoints: { icon: "fas fa-language", suffix: "",
                          transform: "unicodeCodePoints" },
      uptime: { icon: "fas fa-stopwatch", transform: "elapsedTime" },
      voltage: { icon: "fas fa-bolt", suffix: " V", transform: "toFixed(2)" },
      voltages: { icon: "fas fa-bolt", suffix: " V",
                  transform: "toFixedArray(2)" }
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

  // Render a single dynamb value
  function renderValue(property, data, target, options) {
    let isKnownProperty = STANDARD_DATA_PROPERTIES.hasOwnProperty(property);
    let content = createElement('span', null, data);

    if(isKnownProperty) {
      let dataRender = STANDARD_DATA_PROPERTIES[property];
      content = renderAsTransform(dataRender.transform, data,
                                  dataRender.suffix);
    }

    if(target) {
      target.replaceChildren(content);
    }

    return content; 
  }

  // Render a single dynamb icon
  function renderIcon(property, target, options) {
    let isKnownProperty = STANDARD_DATA_PROPERTIES.hasOwnProperty(property);
    let content = createElement('i', 'fas fa-question-circle');

    if(isKnownProperty) {
      content = createElement('i', STANDARD_DATA_PROPERTIES[property].icon);
    }

    if(target) {
      target.replaceChildren(content);
    }

    return content; 
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
      case 'booleanArray':
        return renderBooleanArray(data);
      case 'elapsedTime':
        return renderElapsedTime(data);
      case 'unicodeCodePoints':
        return renderUnicodeCodePoints(data);
      case 'position':
        return renderPosition(data);
      case 'progressPercentage':
        return renderProgress(data, 100, 0, '%');
      case 'progressXYZ':
        return renderProgressXYZ(data, suffix);
      case 'rotationDegrees':
        return renderRotationDegrees(data);
      case 'toFixed(0)':
        return data.toFixed(0) + suffix;
      case 'toFixed(2)':
        return data.toFixed(2) + suffix;
      case 'toFixedArray(0)':
        return renderNumberArray(data, 0, suffix);
      case 'toFixedArray(2)':
        return renderNumberArray(data, 2, suffix);
      case 'localeString':
        return data.toLocaleString() + suffix;
      case 'tableNearest':
        return renderTableDevices(data, 'rssi', suffix);
      case 'tableDigest':
        return renderTableDevices(data.interactions, 'count', suffix,
                                  data.timestamp);
      default:
        return data.toString() + suffix;
    }
  }

  // Render an array of boolean values
  function renderBooleanArray(values) {
    let buttons = [];

    for(const value of values) {
      let iconClass = value ? 'fas fa-check' : 'fas fa-times';
      let buttonClass = value ? 'btn btn-success' : 'btn btn-outline-info';
      let icon = createElement('i', iconClass);
      buttons.push(createElement('button', buttonClass, icon));
    }

    let buttonGroup = createElement('div', 'btn-group btn-group-sm', buttons);

    return createElement('div', 'btn-toolbar', buttonGroup);
  }

  // Render an elapsed time in the appropriate units
  function renderElapsedTime(elapsedTime) {
    let representation = '';
    let remainingTime = elapsedTime;

    if(remainingTime > MS_IN_YEAR) {
      let years = Math.floor(remainingTime / MS_IN_YEAR);
      representation += years + (years === 1 ? ' year, ' : ' years, ');
      remainingTime -= (years * MS_IN_YEAR);
    }
    if((remainingTime !== elapsedTime) || (remainingTime > MS_IN_DAY)) {
      let days = Math.floor(remainingTime / MS_IN_DAY);
      representation += days + (days === 1 ? ' day, ' : ' days, ');
      remainingTime -= (days * MS_IN_DAY);
    }
    if((remainingTime !== elapsedTime) || (remainingTime > MS_IN_HOUR)) {
      let hours = Math.floor(remainingTime / MS_IN_HOUR);
      representation += hours + 'h';
      remainingTime -= (hours * MS_IN_HOUR);
    }
    if((remainingTime !== elapsedTime) || (remainingTime > MS_IN_MINUTE)) {
      let minutes = Math.floor(remainingTime / MS_IN_MINUTE);
      representation += (minutes + 'm').padStart(3, '0');
      remainingTime -= (minutes * MS_IN_MINUTE);
    }
    let seconds = Math.round(remainingTime / MS_IN_SECOND);
    representation += (seconds + 's').padStart(3, '0');

    return representation;
  }

  // Render an array of numbers
  function renderNumberArray(values, precision, suffix) {
    let lis = [];

    for(const value of values) {
      let displayValue = Number.isFinite(value) ? value.toFixed(precision) :
                                                  '\u2014';
      let itemClass = Number.isFinite(value) ? 'list-inline-item' :
                                               'list-inline-item text-muted';
      lis.push(createElement('li', itemClass, displayValue + suffix));
    }

    return createElement('ul', 'list-inline mb-0', lis);
  }

  // Render an array of Unicode code points
  function renderUnicodeCodePoints(codePoints) {
    let characters = "";

    for(const codePoint of codePoints) {
      characters += String.fromCodePoint(codePoint);
    }

    return createElement('span', 'display-1', characters);
  }

  // Render a 2D or 3D position
  function renderPosition(position) {
    let list = position[1] + '\u00b0 ' + ((position[1] >= 0) ? '(N)' : '(S)') +
               ', ' +
               position[0] + '\u00b0 ' + ((position[0] >= 0) ? '(E)' : '(W)');
    if(position.length > 2) {
      list += ', ' + position[2] + 'm';
    }

    return list;
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

  // Render rotation in degrees
  function renderRotationDegrees(data) {
    let arrow = createElement('i',
                          'fas fa-arrow-circle-up text-primary d-inline-block');
    let text = ' \u00a0 ' + data + ' \u00b0';

    arrow.setAttribute('style',
                       'transform: rotate(' + data.toFixed(0) + 'deg)');

    return createElement('div', 'align-middle', [ arrow, text ]);
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
    render: render,
    renderIcon: renderIcon,
    renderValue: renderValue
  }

}());