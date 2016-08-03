/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


DEFAULT_BUBBLE_SIZE = '240px';
BUBBLE_TEMPLATE_URL = 'bubble.html';
TYPE_PERSON = 'Person';
TYPE_PRODUCT = 'Product';
TYPE_PLACE = 'Place';
DEFAULT_IMAGE = {};
DEFAULT_IMAGE[TYPE_PERSON] = 'images/default-person.png';
DEFAULT_IMAGE[TYPE_PRODUCT] = 'images/default-product.png';
DEFAULT_IMAGE[TYPE_PLACE] = 'images/default-place.png';


angular.module('reelyactive.cuttlefish', [])

  .directive('bubble', function() {

    function link(scope, element, attrs) {

      function update() {
        scope.toggle = 0;
        scope.types = [];
        scope.size = scope.size || DEFAULT_BUBBLE_SIZE;

        var graph = scope.json["@graph"];
        for(var cItem = 0; cItem < graph.length; cItem++) {
          switch(graph[cItem]["@type"]) {
            case 'schema:Person':
              scope.person = formatItem(graph[cItem], TYPE_PERSON);
              scope.types.push(TYPE_PERSON);
              break;
            case 'schema:Product':
              scope.product = formatItem(graph[cItem], TYPE_PRODUCT);
              scope.types.push(TYPE_PRODUCT);
              break;
            case 'schema:Place':
              scope.place = formatItem(graph[cItem], TYPE_PLACE);
              scope.types.push(TYPE_PLACE);
              break;
          }
          scope.itemID = graph[cItem]["@id"];
        }
        scope.current = scope.types[0];
      }

      function formatItem(item, type) {
        if(!item.hasOwnProperty("schema:image")) {
          item["schema:image"] = DEFAULT_IMAGE[type];
        }
        return item;
      }

      scope.$watch(attrs.json, function(json) {
        //scope.json = json;
        update();
      });
    }

    return {
      restrict: "E",
      scope: {
        json: "=",
        size: "@"
      },
      link: link,
      templateUrl: BUBBLE_TEMPLATE_URL
    }
  });
