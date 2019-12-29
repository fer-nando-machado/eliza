app.controller('usuarios', function(dao, users, pager, alert, utils, navigator) {
    var vm = this;
  
    vm.initUsuarios = function() {
      vm.findUsuarios();
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.usuarios.length, page);
      vm.items = vm.usuarios;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.usuarios.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.newPassword = function(password) {
      return {
        original: password,
        confirmation: password
      }
    };
  
    vm.createUsuario = function(login) {
      vm.usuario = new Object();
      vm.usuario.login = login;
      vm.password = vm.newPassword()
      vm.validatePassword(vm.password);
    };
  
    vm.saveUsuario = function(usuario) {
      usuario.loginSearch = utils.normalize(usuario.login);
      usuario.nomeSearch = utils.normalize(usuario.nome);
      usuario.password = utils.encrypt(vm.password.original);
      if (usuario._id) {
        vm.updateUsuario(usuario);
      } else {
        vm.insertUsuario(usuario);
      }
    };

    vm.saveUsuarioAndRestart = function(usuario) {
      vm.saveUsuario(usuario);
      // trocar por logout
      users.logout();
      navigator.go(route.login);
      alert.success("Faça login com o seu usuário para começar a usar o Eliza.");
    }
  
    vm.insertUsuario = function(usuario) {
      var promise = dao.insert(dao.db.usuarios, usuario);
      promise.then(function(doc) {
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário cadastrado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar cadastrar o usuário. (" + err + ")");
      });
    };
  
    vm.updateUsuario = function(usuario) {
      var promise = dao.update(dao.db.usuarios, {_id: usuario._id}, usuario, false);
      promise.then(function(doc) {
        if (users.getCurrent()._id == doc._id) {
          users.setCurrent(doc);
        }
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário atualizado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar atualizar o usuário. (" + err + ")");
      });
    };
  
    vm.findUsuarios = function() {
      if (users.isAdmin()) {
        var promise = dao.find(dao.db.usuarios, {}, {loginSearch: 1});
        promise.then(function(docs) {
          vm.usuarios = docs;
          vm.setPage(1);
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
        });
      } else {
        var promise = dao.find(dao.db.usuarios, {"_id": users.getCurrent()._id}, {});
        promise.then(function(docs) {
          vm.usuarios = docs;
          vm.setPage(1);
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
        });
      }
    };
  
    vm.findUsuariosByLogin = function(login) {
      var promise = dao.find(dao.db.usuarios, {loginSearch: utils.newRegExp(login), "level": {$gt: "0"}}, {loginSearch: 1});
      promise.then(function(docs) {
        vm.usuarios = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
      });
    };
  
    vm.findUsuarioById = function(id) {
      var promise = dao.findOne(dao.db.usuarios, {_id: id});
      promise.then(function(doc) {
        vm.usuario = doc;
        vm.password = vm.newPassword(utils.decrypt(vm.usuario.password));
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o usuário. (" + err + ")");
      });
    };
  
    vm.removeUsuario = function(usuario) {
      if (!confirm('Tem certeza que deseja remover este usuário?')) {
        return;
      }
      var promise = dao.remove(dao.db.usuarios, {_id: usuario._id}, false);
      promise.then(function(count) {
        vm.usuario = null;
        vm.findUsuarios();
        alert.success("Usuário removido.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar remover o usuário. (" + err + ")");
      });
    };
  
    vm.validatePassword = function(password) {
      if (!password.original) {
        password.error = {'required': true};
      } else if (password.original != password.confirmation) {
        password.error = {'password': true};
      } else {
        password.error = null;
      }
    };
  
  });