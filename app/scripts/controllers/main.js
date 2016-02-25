'use strict';

/**
 * @ngdoc function
 * @name statRollerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the statRollerApp
 */
angular.module('statRollerApp')
  .controller('MainCtrl', function() {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  })
  .filter('signedNumber', function() {
    return function(input) {
      if (!input) {
        input = 0;
      }
      return (input < 0 ? '\u2212' : '\u002B') + Math.abs(input);
    };
  })
  .filter('rollOption', function() {
    return function(roll) {
      return roll.lower + '-' + roll.upper + ' ' + roll.name;
    };
  })
  .filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function(a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      if (reverse) {
        filtered.reverse();
      }
      return filtered;
    };
  })
  .filter('capitalize', function() {
    return function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  })
  .filter('raceWithModifiers', function() {
    return function(race) {
      var abilityNames = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma', 'Any'];
      var verboseArray = [];
      angular.forEach(race['Ability Modifiers'], function(bonus, element) {
        if (abilityNames.indexOf(element) > -1) {
          this.push(bonus + ' ' + element.substr(0, 3));
        }
      }, verboseArray);

      return race.name + (verboseArray.length > 0 ? ' (' + verboseArray.join('; ') + ')' : '');
    };
  });
