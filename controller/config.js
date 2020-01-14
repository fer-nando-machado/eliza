app.controller('config', function(dao, alert, utils) {
    var vm = this;

    const defaultConfig = {
      pageSize: 10,
    };

    vm.initConfig = function() {
      vm.loadConfig();
    };
  
    vm.loadConfig = function() {
      var promise = dao.findOne(dao.db.config);
      promise.then(function(doc) {
        let config = {...defaultConfig, ...doc};
        if (config.firebasePassword) {
          config.firebasePassword = utils.decrypt(config.firebasePassword);
        }
        vm.config = config;
        utils.setCurrentConfig(config);
      }, function(err) {
        console.log(err);
      });
    };
  
    vm.saveConfig = function(config) {
      const configToSave = {...config};
      if (configToSave.firebasePassword) {
        configToSave.firebasePassword = utils.encrypt(configToSave.firebasePassword);
      }
      if (configToSave._id) {
        vm.updateConfig(configToSave);
      } else {
        vm.insertConfig(configToSave);
      }
    };
  
    vm.insertConfig = function(config) {
      var promise = dao.insert(dao.db.config, config);
      promise.then(function(doc) {
        vm.loadConfig();
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.error(err);
        alert.error("Ocorreu um problema ao atualizar as configurações.");
      });
    };
  
    vm.updateConfig = function(config) {
      var promise = dao.update(dao.db.config, {_id: config._id}, config, false);
      promise.then(function(doc) {
        vm.loadConfig();
        alert.success("Configurações atualizadas.");
      }, function(err) {
        console.error(err);
        alert.error("Ocorreu um problema ao atualizar as configurações.");
      });
    };
  });