DEFAULT_POLLING_MILLISECONDS = 2000;

angular.module('response', [ 'ui.bootstrap' ])

  // API controller
  .controller('ApiCtrl', function($scope, $http, $interval, $window) {
    var url = $window.location.href;
    $scope.meta = { message: "loading", statusCode: "..." };
    $scope.links = { self: { href: url } };
    $scope.devices = {};
    $scope.metadata = {};
    $scope.expand = true;

    function attachMetadata() {
      for(var id in $scope.devices) {
        if ($scope.devices.hasOwnProperty(id)) {
          var device = $scope.devices[id];
          if(typeof($scope.metadata[id]) != 'undefined') {
            device.metadata = JSON.stringify($scope.metadata[id], null, "  ");
          }
        }
      }
    };

    function updateQuery() {
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get(url)
        .success(function(data, status, headers, config) {
          $scope.meta = data._meta;
          $scope.links = data._links;
          $scope.devices = data.devices;
          attachMetadata();
        })
        .error(function(data, status, headers, config) {
          $scope.meta = data._meta;
          $scope.links = data._links;
          $scope.devices = {};
        });
    };

    $scope.fetch = function (id) {
      if((typeof($scope.devices[id]) != 'undefined') &&
         (typeof($scope.devices[id].url) != 'undefined')) {
        $http.defaults.headers.common.Accept = 'application/json';
        $http.get($scope.devices[id].url)
          .success(function(data, status, headers, config) {
            $scope.metadata[id] = data;
            attachMetadata();
          })
          .error(function(data, status, headers, config) {
            $scope.metadata[id] = { error: error };
          });
      }
      else {
        $scope.metadata[id] = { error: "No URL to fetch" };
      }
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
