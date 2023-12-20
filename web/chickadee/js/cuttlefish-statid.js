/**
 * Copyright reelyActive 2021-2023
 * We believe in an open Internet of Things
 */


let cuttlefishStatid = (function() {

  // Standard data properties (property: {icon, suffix}) in alphabetical order
  const STANDARD_DATA_PROPERTIES = {
      appearance: { icon: "fas fa-eye" },
      deviceIds: { icon: "fas fa-barcode", transform: "idList" },
      languages: { icon: "fas fa-language", transform: "stringArray" },
      name: { icon: "fas fa-id-card" },
      uri: { icon: "fas fa-link", transform: "uri" },
      uuids: { icon: "fas fa-barcode", transform: "idList" },
      version: { icon: "fas fa-info", suffix: " (version)" }
  };

  // Render a statid
  function render(statid, target, options) {
    let tbody = createElement('tbody');
    let table = createElement('table', 'table', tbody);

    for(const property in statid) {
      let tr = renderAsRow(property, statid[property]);

      if(tr) {
        tbody.appendChild(tr);
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
      case 'uri':
        return renderUri(data);
      case 'idList':
        return renderListGroupArray(data);
      case 'stringArray':
        return renderStringArray(data);
      default:
        return data.toString() + suffix;
    }
  }

  // Render a URI
  function renderUri(data) {
    let a = createElement('a', 'text-truncate', data);
    a.setAttribute('href', data);
    a.setAttribute('target', '_blank');

    return a;
  }

  // Render an identifier array in list group format
  function renderListGroupArray(data) {
    if(data.length === 1) {
      return createElement('span', 'font-monospace', data[0].toString());
    }

    let items = [];

    data.forEach(function(entry) {
      items.push(createElement('li', 'list-group-item font-monospace', entry));
    });

    return createElement('ul', 'list-group list-group-flush', items);
  }

  // Render an array of strings
  function renderStringArray(elements) {
    let lis = [];

    for(const element of elements) {
      lis.push(createElement('li', 'list-inline-item', element));
    }

    return createElement('ul', 'list-inline mb-0', lis);
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