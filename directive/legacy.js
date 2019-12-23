app.directive('legacy', function () {
    return {
      require: 'vm',
      scope: {
        legacy: '=',
        value: '=',
      },
      restrict: 'E',
      template: '<span ng-class="{legacy: legacy}">{{value}} <span class="glyphicon glyphicon-hourglass small" ng-if="legacy"></span></span>'
    };
  });
  