'use strict';

angular.module('statRollerApp')
  .factory('RaceFactory', function($http, $q) {
    var factory = {
      getRaceList: function() {
        var deferred = $q.defer();
        $http.get('data/races.json').success(function(data) {
          var array = [];
          angular.forEach(data, function(race) {
            this.push(race);
          }, array);
          deferred.resolve(array);
        });
        return deferred.promise;
      },

      getRaces: function() {
        var deferred = $q.defer();
        $http.get('data/races.json').success(function(data) {
          deferred.resolve(data);
        });
        return deferred.promise;
      }
    };
    return factory;
  });
