/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


let cuttlefishEncrypted = (function() {

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

  // Standard data properties (property: {icon, suffix}) in alphabetical order
  const STANDARD_DATA_PROPERTIES = {
      checksum: { icon: "fas fa-hashtag", transform: "monospace" },
      data: { icon: "fas fa-code", transform: "monospace" },
      deviceId: { icon: "fas fa-wifi", transform: "monospace" },
      method: { icon: "fas fa-cog" },
      salt: { icon: "fas fa-redo", transform: "monospace" }
  };

  // Render encrypted data
  function render(encrypted, target, options) {
    options = options || {};
    let tbody = createElement('tbody');
    let table = createElement('table', 'table', tbody);

    if(encrypted.hasOwnProperty('timestamp')) {
      let localeTimestamp =
                         new Date(encrypted['timestamp']).toLocaleTimeString();
      let captionIcon = createElement('i', 'fas fa-clock');
      let captionText = ' \u00a0' + localeTimestamp;
      let caption = createElement('caption', 'caption-top',
                                  [ captionIcon, captionText ]);
      table.appendChild(caption);
    }
    if(encrypted.hasOwnProperty('deviceId') &&
       encrypted.hasOwnProperty('deviceIdType') && !options.hideDeviceId) {
      let deviceId = encrypted.deviceId + ' / ' +
                     IDENTIFIER_TYPES[encrypted.deviceIdType];
      let tr = renderAsRow('deviceId', deviceId);
      tr.setAttribute('class', 'table-active');
      tbody.appendChild(tr);
    }

    for(const property in encrypted) {
      if((property !== 'timestamp') && (property !== 'deviceId') &&
         (property !== 'deviceIdType')) {
        let tr = renderAsRow(property, encrypted[property]);

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
      case 'monospace':
        return createElement('span', 'font-monospace', data + suffix);
      default:
        return data.toString() + suffix;
    }
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