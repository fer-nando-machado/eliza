app.controller('header', function(navigator) {
    var vm = this;
  
    vm.go = function(path) {
      navigator.go(path);
    };
  
    vm.isActive = function(path) {
      return navigator.where() == '/'+path;
    };
  
  });
  