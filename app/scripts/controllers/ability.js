'use strict';

angular.module('statRollerApp')
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
      // scope: {stat: '@ability'},
      templateUrl: '/views/ability-score.html',
      // controller: function($scope) {
      //
      // }
    };
  })
  .directive('scoreDisplay', function() {
    return {
      restrict: 'E',
      scope: {
        value: '=',
        label: '@',
        prefix: '@'
      },
      transclude: true,
      template: '<div class="prefix" ng-bind="showAdder()"></div><div><div class="score" ng-bind="showValue()"></div><label ng-bind="this.label"></label></div>',
      link: function(scope) {
        scope.showAdder = function() {
          if (this.prefix === '+') {
            return this.value < 0 ? '\u2212' : '\u002B';
          } else {
            return this.prefix;
          }
        };

        scope.showValue = function() {
          if (this.prefix === '+') {
            return Math.abs(this.value);
          } else {
            return this.value;
          }
        };
      }
    };
  })
  .directive('scoreInput', function() {
    return {
      restrict: 'E',
      scope: {
        min: '=',
        max: '=',
        init: '@',
        title: '@',
        prefix: '@'
      },
      transclude: true,
      require: 'ngModel',
      template: '<div class="prefix"></div><div><div class="score"></div><label></label></div>',
      link: function(scope, iElement, iAttrs, ngModelController) {
        ngModelController.$render = function() {
          if (scope.prefix) {
            iElement.find('div.prefix').text(scope.prefix);
          }
          iElement.find('div.score').text(ngModelController.$viewValue);
          iElement.find('label').text(scope.title);
        };

        function updateModel(offset) {
          ngModelController.$setViewValue(ngModelController.$viewValue + offset);
          ngModelController.$render();
        }

        ngModelController.$setViewValue(scope.init * 1 || 0);
        ngModelController.$render();

        iElement.bind('click', function(event) {
          scope.$apply(function() {
            event.preventDefault();
            if (ngModelController.$viewValue < scope.max) {
              updateModel(+1);
            }
          });
        });

        iElement.bind('contextmenu', function(event) {
          scope.$apply(function() {
            event.preventDefault();
            if (ngModelController.$viewValue > scope.min) {
              updateModel(-1);
            }
          });
        });
      }
    };
  })
  .controller('AbilityCtrl', function($scope, AbilityFactory, RaceFactory, RollerFactory) {
    $scope.selectedOption = '0';
    $scope.selectedAge = 'Adulthood';

    $scope.selectRollOption = function() {
      resetAbilityBaseScores();
      switch ($scope.selectedOption) {
        case '1':
          $scope.rollType = '3d6';
          break;
        case '2':
          $scope.rollType = '4d6-L';
          break;
        case '3':
          $scope.pointbuyPoints = '10';
          break;
        case '4':
          $scope.pointbuyPoints = '15';
          break;
        case '5':
          $scope.pointbuyPoints = '20';
          break;
        case '6':
          $scope.pointbuyPoints = '25';
          break;
      }
    };

    function resetAbilityBaseScores() {
      for (var ability in $scope.character.abilities) {
        $scope.character.abilities[ability].baseScore = 10;
      }
    }

    $scope.pointbuyPointsSpent = function() {
      var tally = 0;
      for (var ability in $scope.character.abilities) {
        tally += getPointBuyCost($scope.character.abilities[ability].baseScore);
      }
      return tally;
    };

    $scope.adjustMaximum = function(ability) {
      var pointsAvailable = $scope.pointbuyPoints - $scope.pointbuyPointsSpent;
      if (getPointBuyCost($scope.character.abilities[ability].baseScore * 1 + 1) >= pointsAvailable) {
        return $scope.character.abilities[ability].baseScore + 1;
      } else {
        return $scope.character.abilities[ability].baseScore;
      }
    };

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

    $scope.getAgeModifier = function(ability) {
      var modifier = 0;
      switch ($scope.selectedAge) {
        case 'Young':
          switch (ability.name) {
            case 'Strength':
              modifier = -2;
              break;
            case 'Dexterity':
              modifier = +2;
              break;
            case 'Constitution':
              modifier = -2;
              break;
            case 'Wisdom':
              modifier = -2;
          }
          break;
        case 'Adulthood':
          break;
        case 'Middle Age':
          modifier = 1;
          break;
        case 'Old':
          modifier = 2;
          break;
        case 'Venerable':
          modifier = 3;
          break;
      }
      return (ability.type === 'Physical' && $scope.selectedAge !== 'Young') ? -modifier : modifier;
    };

    $scope.bonusAbilityPoints = function() {
      return Math.floor($scope.character.level / 4, 0);
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

    $scope.checkPoints = function() {
      var lowestLevel = $scope.bonusAbilityPointsSpent() * 4;
      if ($scope.character.level < lowestLevel) {
        $scope.character.level = lowestLevel;
      }
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
        $scope.character.abilities[ability.name].baseScore + $scope.getRacialModifier(ability.name) + $scope.getAgeModifier(ability) + $scope.character.abilities[ability.name].bonusPoints;
      return $scope.character.abilities[ability.name].adjustedScore;
    };

    $scope.getAbilityModifier = function(ability) {
      $scope.character.abilities[ability.name].modifier = Math.floor($scope.getAdjustedScore(ability) / 2) - 5;
      return $scope.character.abilities[ability.name].modifier;
    };

    function getPointBuyCost(score) {
      return [-4, -2, -1, 0, 1, 2, 3, 5, 7, 10, 13, 17][score - 7];
    }
  });
