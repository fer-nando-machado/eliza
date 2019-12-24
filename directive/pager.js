app.directive('pager', function () {
    return {
      require: 'vm',
      scope: {
        vm: '='
      },
      restrict: 'E',
      templateUrl: 'view/pager.html',
    };
  });
