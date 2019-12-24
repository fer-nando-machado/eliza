app.controller('login', function($scope, $location, dao, utils, alert) {
    var vm = this;
    var db = {};
  
    vm.initLogin = function() {
      db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
  
      var promise = dao.ensureUniqueIndex(db.usuarios, 'login');
      promise.then(function() {
        console.log('Unique constraint usuarios.login ativada com sucesso.');
      }, function(err) {
        console.log('Erro ao criar unique constraint.');
        console.log(err);
      });
  
      var promise = dao.find(db.usuarios, {}, {});
      promise.then(function(docs) {
        if (!docs.length) {
          var usuario = {
            nome: 'root',
            login: 'root',
            password: 'cm9vdA==',
            level: '0'
          }
          var promise = dao.insert(db.usuarios, usuario);
          promise.then(function(doc) {
            console.log('Usuário root criado.');
          }, function(err) {
            console.log('Erro ao criar o usuário root.');
            console.log(err);
          });
        }
      }, function(err) {
        console.log('Erro ao carregar usuários.');
        console.log(err);
      });
    };
  
    vm.validateLogin = function(login) {
      var promise = dao.findOne(db.usuarios, {login: login.login, password: utils.encrypt(login.password)});
      promise.then(function(doc) {
        if (!doc) {
          alert.warning("Combinação de login e/ou senha inválida. Por favor, tente novamente.");
        } else {
          vm.go('agenda');
          alert.info("Iniciando sessão de " + doc.login + ".");
          utils.setCurrentUser(doc);
        }
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema durante a autenticação. (" + err + ")");
      });
    };
  
    vm.logout = function() {
      alert.info("Encerrando sessão de " + utils.getCurrentUser().login + ".");
      utils.setCurrentUser();
    };
  
    vm.go = function(path) {
      $location.path(path);
    };
  
  });
  