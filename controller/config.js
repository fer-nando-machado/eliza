app.controller('config', function($rootScope, $scope, dao, alert) {
    var vm = this;
    var db = {};
  
    vm.initConfig = function() {
      db.config = new Datastore({ filename: 'db/config.db', autoload: true});
      vm.loadConfig();
    };
  
    vm.loadConfig = function() {
      var promise = dao.findOne(db.config);
      promise.then(function(doc) {
        vm.config = doc;
        if (!vm.config.pageSize) {
          vm.config.pageSize = 10;
        }
      }, function(err) {
        console.log(err);
      });
    };
  
    vm.saveConfig = function(config) {
      if (config._id) {
        vm.updateConfig(config);
      } else {
        vm.insertConfig(config);
      }
    };
  
    vm.insertConfig = function(config) {
      var promise = dao.insert(db.config, config);
      promise.then(function(doc) {
        vm.config = doc;
        $rootScope.config = doc;
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
      });
    };
  
    vm.updateConfig = function(config) {
      var promise = dao.update(db.config, {_id: config._id}, config, false);
      promise.then(function(doc) {
        vm.config = doc;
        $rootScope.config = doc;
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
      });
    };
  });