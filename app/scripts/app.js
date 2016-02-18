'use strict';

/**
 * @ngdoc overview
 * @name statRollerApp
 * @description
 * # statRollerApp
 *
 * Main module of the application.
 */
angular
  .module('statRollerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch','roller'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/roller', {
        templateUrl: 'views/roller.html',
        controller: 'AbilityCtrl',
        controllerAs: 'ability'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
