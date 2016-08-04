DEFAULT_POLLING_MILLISECONDS = 2000;

angular.module('response', [ 'ui.bootstrap', 'reelyactive.cormorant',
                             'reelyactive.cuttlefish' ])

  // API controller
  .controller('ApiCtrl', function($scope, $http, $interval, $window,
                                  cormorant) {
    var url = $window.location.href;
    $scope.meta = { message: "loading", statusCode: "..." };
    $scope.links = { self: { href: url } };
    $scope.devices = {};
    $scope.stories = cormorant.getStories();
    $scope.storyStrings = {};
    $scope.showStory = {};
    $scope.associations = {};
    $scope.associationsTemplate = "associations.html";
    $scope.expand = true;

  $scope.json = {
    "@context": {
      "schema": "http://schema.org/"
    },
    "@graph": [
      {
        "@id": "person",
        "@type": "schema:Person",
        "schema:givenName": "Barn",
        "schema:familyName": "Owl",
        "schema:worksFor": "reelyActive",
        "schema:jobTitle": "Mascot",
        "schema:image": "http://reelyactive.com/images/barnowl.jpg"
      },
      {
        "@id": "product",
        "@type": "schema:Product",
        "schema:name": "915MHz Active RFID Tag",
        "schema:image": "http://reelyactive.com/images/tag400x400.jpg"
      }
    ]
  };


    function updateQuery() {
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get(url)
        .success(function(data, status, headers, config) {
          $scope.meta = data._meta;
          $scope.links = data._links;
          $scope.devices = data.devices;
          fetchStories(data.devices);
        })
        .error(function(data, status, headers, config) {
          $scope.meta = data._meta;
          $scope.links = data._links;
          $scope.devices = {};
        });
    }

    function fetchStories(devices) {
      for(id in devices) {
        cormorant.getStory(devices[id].url, function(story, url) {
          if(url && !$scope.storyStrings.hasOwnProperty(url)) {
            if(story) {
              $scope.storyStrings[url] = JSON.stringify(story, null, "  ");
            }
            else {
              $scope.storyStrings[url] = "ERROR: Could not fetch URL";
            }
          }
        });
        $scope.showStory[id] = $scope.showStory[id] || false;
      }
    }

    $scope.getAssociations = function (id) {
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get($scope.devices[id].href)
        .success(function(data, status, headers, config) {
          var device = data.devices[id];
          $scope.associations[id] = {};
          if(device.url) {
            $scope.associations[id].url = device.url;
          }
          if(device.directory) {
            $scope.associations[id].directory = device.directory;
          }
          if(device.tags) {
            $scope.associations[id].tags = device.tags;
          }
        })
        .error(function(data, status, headers, config) {
          $scope.associations[id] = { error: "No explicit associations" };
        });
    };

    $scope.displayDirectory = function (id) {
      if((typeof($scope.associations[id]) === 'undefined') ||
         (typeof($scope.associations[id].directory) === 'undefined')) {
        return '(none)';
      }
      return $scope.associations[id].directory; 
    };

    $scope.isEmpty = function () {
      return (Object.keys($scope.devices).length === 0);
    };

    $scope.updatePeriod = function (period) {
      if(period) {
        $scope.pollingMessage = "Polling every " + (period / 1000) + "s";
        $interval.cancel($scope.pollingPromise);
        $scope.pollingPromise = $interval(updateQuery, period);
        updateQuery();
      }
      else {
        $scope.pollingMessage = "Polling disabled";
        $interval.cancel($scope.pollingPromise);
      }
    };

    updateQuery();
    $scope.updatePeriod(DEFAULT_POLLING_MILLISECONDS);
  });
