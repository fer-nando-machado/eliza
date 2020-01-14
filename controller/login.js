app.controller('login', function(navigator, dao, utils, users, alert) {
    var vm = this;
  
    vm.initLogin = function() {  
      var promise = dao.ensureUniqueIndex(dao.db.usuarios, 'login');
      promise.then(function() {
        console.log('Unique constraint usuarios.login ativada com sucesso.');
      }, function(err) {
        console.log('Erro ao criar unique constraint.');
        console.log(err);
      });
    };
  
    vm.validateLogin = function(login) {
      var promise = dao.findOne(dao.db.usuarios, {login: login.login, password: utils.encrypt(login.password)});
      promise.then(function(doc) {
        if (!doc) {
          alert.warning("Combinação de login e/ou senha inválida. Por favor, tente novamente.");
        } else {
          vm.go(route.agenda);
          alert.info("Iniciando sessão de " + doc.login + ".");
          users.setCurrent(doc);
        }
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema durante a autenticação. (" + err + ")");
      });
    };
  
    vm.logout = function() {
      alert.info("Encerrando sessão de " + users.getCurrent().login + ".");
      users.logout();
    };
  
    vm.go = function(path) {
      navigator.go(path);
    };
  
  });
  