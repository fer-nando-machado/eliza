app.controller('config', function(dao, alert, utils) {
    var vm = this;
  
    vm.initConfig = function() {
      vm.loadConfig();
    };
  
    vm.loadConfig = function() {
      var promise = dao.findOne(dao.db.config);
      promise.then(function(doc) {
        vm.config = doc;
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
      var promise = dao.insert(dao.db.config, config);
      promise.then(function(doc) {
        vm.config = doc;
        utils.setCurrentConfig(doc);
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
      });
    };
  
    vm.updateConfig = function(config) {
      var promise = dao.update(dao.db.config, {_id: config._id}, config, false);
      promise.then(function(doc) {
        vm.config = doc;
        utils.setCurrentConfig(doc);
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
      });
    };
  });