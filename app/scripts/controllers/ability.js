'use strict';

angular.module('statRollerApp')
  .factory('RaceFactory', function($http, $q) {
    var factory = {};
    var abilityNames = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma", "Any"];

    factory.getRaceList = function() {
      var deferred = $q.defer();
      $http.get('data/races.json').success(function(data) {
        var array = [];
        for (var key in data) {
            var race = data[key];
            var verboseArray = [];
            for (var element in race["Ability Modifiers"]) {
                if (abilityNames.indexOf(element) > -1) {
                    verboseArray.push(race["Ability Modifiers"][element] + ' ' + element.substr(0,3) );
                }
            }
            race.verboseName = race.name;
            if(verboseArray.length > 0) {
                race.verboseName += ' (' + verboseArray.join('; ') + ')';
            }
            array.push(race);
        }
        deferred.resolve(array);
      });
      return deferred.promise;
    };
    factory.getRaces = function() {
      var deferred = $q.defer();
      $http.get('data/races.json').success(function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    };
    return factory;
  })

.factory('AbilityFactory', function() {
  var abilityNames = [{
    name: 'Strength',
    type: 'Physical'
  }, {
    name: 'Dexterity',
    type: 'Physical'
  }, {
    name: 'Constitution',
    type: 'Physical'
  }, {
    name: 'Intelligence',
    type: 'Mental'
  }, {
    name: 'Wisdom',
    type: 'Mental'
  }, {
    name: 'Charisma',
    type: 'Mental'
  }];
  var abilities = {};
  for (var ability in abilityNames) {
    abilities[abilityNames[ability].name] = {
      id: ability,
      type: abilityNames[ability].type,
      name: abilityNames[ability].name
    };
  }
  return abilities;
})

.directive('abilityScore', function() {
    return {
        restrict: 'E',
        template: '<label>{{ ability.name }}</label>'
            +'<div class="calculation stat" id="{{ ability.name }}"><div>'
            +'<input type="number" min="3" max="18" ng-model="character.abilities[ability.name].baseScore" ng-init="character.abilities[ability.name].baseScore=10">'
            +'<label>Base Score</label></div><div ng-show="bonusAbilityPoints()">'
            +'<div>+</div>'
            +'<input type="number" min="0" max="{{ pointsLeft(ability) }}" ng-model="character.abilities[ability.name].bonusPoints" ng-init="character.abilities[ability.name].bonusPoints=0">'
            +'<label>Bonus Points</label></div>'
            +'<div ng-show="character.race">'
            +'<div>+</div>'
            +'<input type="text" disabled value="{{ getRacialModifier(ability.name) | signedNumber}}"><label>Racial Bonus</label></div><div ng-show="getAgeModifier(ability)">'
            +'<div>+</div>'
            +'<div><input type="text" disabled value="{{ getAgeModifier(ability) | signedNumber }}">'
            +'<label>Age Modifier</label></div></div>'
            +'<div><div>=</div>'
            +'<input type="number" class="result" disabled value="{{ getAdjustedScore(ability) }}">'
            +'<label>Adjusted Score</label></div><div><input type="text" class="result" disabled value="{{ getAbilityModifier(ability) | signedNumber }}"><label>Ability Modifier</label></div></div>',
    };
})

.controller('AbilityCtrl', function($scope, AbilityFactory, RaceFactory, RollerFactory) {
    $scope.character = {
      experience: 0,
      abilities: {},
      classes: {},
      favoredClasses: 1,
      favoredBonuses: {
        'Skill': {
          name: 'Skill Point',
          points: 0
        },
        'HP': {
          name: 'Hit Point',
          points: 0
        }
      },
      skills: {},
      traits: {},
      level: 1,
      setRace: function(race) {
        $scope.racialBonus = '';
        for (var key in $scope.character.favoredBonuses) {
          if ($scope.character.favoredBonuses[key].race) {
            if ($scope.character.favoredBonuses[key].race === $scope.character.race.name) {
              delete $scope.character.favoredBonuses[key];
            }
          }
        }
        delete $scope.character.race;
        $scope.character.race = {};

        // remove all Racial Traits
        for (key in $scope.character.traits) {
          if ($scope.character.traits[key].type.indexOf('Racial Trait') > -1) {
            delete $scope.character.traits[$scope.character.traits[key].name];
          }
        }
        // Add Race Elements
        for (key in race) {
          var element = race[key];
          if (element.type) {
            if (element.type !== 'Alternate Racial Trait') {
              $scope.character.traits[key] = element;
            }
          } else {
            $scope.character.race[key] = element;
          }
        }

        for (key in race.favoredOptions) {
          $scope.character.favoredBonuses[key] = race.favoredOptions[key];
          $scope.character.favoredBonuses[key].race = race.name;
          $scope.character.favoredBonuses[key].points = 0;
        }
      }
    };

    $scope.raceList = [];
    $scope.raceSourceList = [];
    RaceFactory.getRaceList().then(function(data) {
      $scope.raceList = data;
      for (var key in data) {
        $scope.raceSourceList.push(data[key].source);
      }
    });



    $scope.abilityList = AbilityFactory;

    $scope.roll = function(notation) {
      for (var key in $scope.abilityList) {
        var roll = RollerFactory.getResult(notation);
        $scope.character.abilities[$scope.abilityList[key].name].baseScore = roll[roll.length - 1].value;
      }
    };

    $scope.getRacialModifier = function(ability) {
      var modifier = 0;
      try {
        var abilityMods = $scope.character.traits['Ability Modifiers'];
        if (abilityMods[ability]) {
          modifier = abilityMods[ability];
        } else if (abilityMods.Any && ability === $scope.racialBonus) {
          modifier = abilityMods.Any;
        }

      } catch (err) {
        //console.log(err);
      }
      return parseInt(modifier);
    };

    $scope.bonusAbilityPoints = function() {
      return Math.round($scope.character.level / 4, 0);
    };

    $scope.bonusAbilityPointsSpent = function() {
      var points = 0;
      for (var key in $scope.abilityList) {
        if ($scope.character.abilities[$scope.abilityList[key].name]) {
          points += $scope.character.abilities[$scope.abilityList[key].name].bonusPoints;
        }
      }
      return points;
    };

    $scope.pointsLeft = function(ability) {
      if ($scope.bonusAbilityPoints() > $scope.bonusAbilityPointsSpent()) {
        return $scope.bonusAbilityPoints();
      } else {
        return $scope.character.abilities[ability.name].bonusPoints;
      }
    };

    $scope.getAdjustedScore = function(ability) {

      $scope.character.abilities[ability.name].adjustedScore =
        $scope.character.abilities[ability.name].baseScore + $scope.getRacialModifier(ability.name) + $scope.character.abilities[ability.name].bonusPoints;
      return $scope.character.abilities[ability.name].adjustedScore;
    };

    $scope.getAbilityModifier = function(ability) {
      $scope.character.abilities[ability.name].modifier = Math.floor($scope.getAdjustedScore(ability) / 2) - 5;
      return $scope.character.abilities[ability.name].modifier;
    };

    $scope.getPointBuyCost = function(score) {
      return [-4, -2, -1, 0, 1, 2, 3, 5, 7, 10, 13, 17][score - 7];
    };
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
});
