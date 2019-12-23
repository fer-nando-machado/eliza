app.controller('header', function($location) {
    var vm = this;
  
    vm.go = function(path) {
      $location.path(path);
    };
  
    vm.isActive = function(path) {
      return $location.path() == '/'+path;
    };
  });
  