app.service('navigator', function($route, $location) {
    this.go = function(to) {
        $location.path(to);
        $route.reload();
    };
    
    this.where = function() {
        return $location.path();
    };

  });
  