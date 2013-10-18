angular.module('app', [])
  .constant('file', '_rewrite/file')
  .constant('api', '_rewrite/api')
  .factory('getTypes', [
    '$http', 
    'api', 
    function ($http, api) {
      return function (params) {
        return $http({
          url: [api, '_view/content_types'].join('/'),
          method: 'GET',
          params: params
        }); 
      };
    }
  ])
  .factory('getContentTypes', [
    'getTypes', 
    function (getTypes) {
      return function (type) {
        return getTypes({
          reduce: false,
          startkey: JSON.stringify([type]),
          endkey: JSON.stringify([type + '\ufff0'])
        });
      };
    }
  ])
  .factory('getFiles', [
    '$http', 
    'api', 
    function ($http, api) {
      return $http({
        url: [api, '_view/timestamps'].join('/'),
        method: 'GET',
        params: {
          descending: true
        }
      });
    }
  ])
  .controller('NavCtrl', [
    '$scope', 
    '$location', 
    'getTypes', 
    function ($scope, $location, getTypes) {
      $scope.goto = function (type) {
        $location.path(['type', type].join('/'));
      };

      getTypes({
        group_level: 1
      }).success(function (body) {
        $scope.types = body.rows.map(function (row) {
          return {
            type: row.key[0],
            count: row.value
          };
        });
      });
    }
  ])
  .controller('WelcomeCtrl', [
    '$scope',
    'getFiles',
    'file',
    function ($scope, getFiles, file) {

      getFiles.success(function (body) {
        $scope.files = body.rows.map(function (row) {
          return {
            id: row.id,
            url: [file, row.id].join('/'),
            type: row.value,
            date: row.key
          };
        });
      });
    }
  ])
  .controller('TypesCtrl', [
    '$scope',
    '$routeParams',
    'getContentTypes',
    'file',
    function ($scope, $routeParams, getContentTypes, file) {
      var type = $scope.type = $routeParams.type;

      getContentTypes(type).success(function (body) {
        $scope.files = body.rows.map(function (row) {
          return {
            id: row.id,
            url: [file, row.id].join('/'),
            type: row.key[1],
            date: row.key[2]
          };
        }).reverse();
      });
    }
  ])
  .config([
    '$routeProvider',
    '$locationProvider', 
    function ($routeProvider, $locationProvider) {
      $routeProvider
      .when('/', {
        templateUrl: 'welcome.html',
        controller: 'WelcomeCtrl'
      })
      .when('/type/:type', {
        templateUrl: 'types.html',
        controller: 'TypesCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    }
  ]);