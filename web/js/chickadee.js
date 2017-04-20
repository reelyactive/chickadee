DEFAULT_POLLING_MILLISECONDS = 2000;
DEFAULT_ORDERING = '+id';

angular.module('response', [ 'ui.bootstrap', 'reelyactive.cormorant',
                             'reelyactive.cuttlefish' ])

  // API controller
  .controller('ApiCtrl', function($scope, $http, $interval, $window,
                                  cormorant) {
    var url = $window.location.href;
    $scope.meta = { message: "loading", statusCode: "..." };
    $scope.links = { self: { href: url } };
    $scope.devices = {};
    $scope.transmitters = [];
    $scope.receivers = [];
    $scope.stories = cormorant.getStories();
    $scope.storyStrings = {};
    $scope.showStory = {};
    $scope.associations = {};
    $scope.associationsTemplate = "associations.html";
    $scope.expand = true;
    $scope.ordering = DEFAULT_ORDERING;
    $http.defaults.headers.common.Accept = 'application/json';

    function updateQuery() {
      $http({ method: 'GET', url: url })
        .then(function(response) { // Success
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = (response.data.devices);
          splitDevices(response.data.devices);
          fetchStories(response.data.devices);
        }, function(response) {    // Error
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = {};
          $scope.transmitters = [];
          $scope.receivers = [];
      });
    }

    function splitDevices(devices) {
      var transmitterArray = [];
      var receiverArray = [];
      for(id in devices) {
        var device = devices[id];
        device.id = id;
        if(device.hasOwnProperty('nearest')) {
          device.rssi = device.nearest[0].rssi;
          transmitterArray.push(device);
        }
        else {
          receiverArray.push(device);
        }
      }
      $scope.transmitters = transmitterArray;
      $scope.receivers = receiverArray;
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

    $scope.getAssociations = function(id) {
      $http({ method: 'GET', url: $scope.devices[id].href })
        .then(function(response) { // Success
          var device = response.data.devices[id];
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
        }, function(response) {    // Error
          $scope.associations[id] = { error: "No explicit associations" };
      });
    };

    $scope.displayDirectory = function(id) {
      if((typeof($scope.associations[id]) === 'undefined') ||
         (typeof($scope.associations[id].directory) === 'undefined')) {
        return '(none)';
      }
      return $scope.associations[id].directory; 
    };

    $scope.isEmpty = function() {
      return (Object.keys($scope.devices).length === 0);
    };

    $scope.updatePeriod = function(period) {
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

    $scope.updateOrdering = function(ordering) {
      switch(ordering) {
        case '+id':
          $scope.ordering = 'id';
          $scope.orderingMessage = 'Increasing ID';
          break;
        case '-id':
          $scope.ordering = '-id';
          $scope.orderingMessage = 'Decreasing ID';
          break;    
        case '+rssi':
          $scope.ordering = 'rssi';
          $scope.orderingMessage = 'Increasing RSSI';
          break;
        case '-rssi':
          $scope.ordering = '-rssi';
          $scope.orderingMessage = 'Decreasing RSSI';
          break; 
      }
    };

    updateQuery();
    $scope.updatePeriod(DEFAULT_POLLING_MILLISECONDS);
    $scope.updateOrdering(DEFAULT_ORDERING);
  });
