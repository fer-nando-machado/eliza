app.service('navigator', function($route, $location) {
    this.go = function(to) {
        console.log(to);
        $location.path(to);
        $route.reload();
    };
    
    this.where = function() {
        return $location.path();
    };

  });
  