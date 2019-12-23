app.controller('alunos', function($scope, dao, pager, alert, utils) {
    var vm = this;
    var db = {};
  
    vm.initAlunos = function() {
      db.alunos = new Datastore({ filename: 'db/alunos.db', autoload: true});
      db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
  
      /*
      var promise = dao.ensureUniqueIndex(db.alunos, 'cpf');
      promise.then(function() {
        console.log('Unique constraint alunos.cpf ativada com sucesso.');
      }, function(err) {
        console.log('Erro ao criar unique constraint.');
        console.log(err);
      });
      */
      vm.findAlunos();
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.alunos.length, page);
      vm.items = vm.alunos;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.alunos.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.createAluno = function(nome) {
      vm.aluno = new Object();
      vm.aluno.nome = nome;
      utils.initContatos(vm.aluno);
    };
  
    vm.saveAluno = function(aluno) {
      aluno.nomeSearch = utils.normalize(aluno.nome);
      aluno.telefones = utils.removeDuplicates(aluno.telefones);
      aluno.emails = utils.removeDuplicates(aluno.emails);
  
      if (aluno._id) {
        vm.updateAluno(aluno);
      } else {
        vm.insertAluno(aluno);
      }
    };
  
    vm.insertAluno = function(aluno) {
      var promise = dao.insert(db.alunos, aluno);
      promise.then(function(doc) {
        vm.aluno = null;
        vm.findAlunos();
        alert.success("Aluno cadastrado.");
      }, function(err) {
        utils.initContatos(aluno);
        console.log(err);
        alert.error("Ocorreu um problema ao tentar cadastrar o aluno. (" + err + ")");
      });
    };
  
    vm.updateAluno = function(aluno) {
      var promise = dao.update(db.alunos, {_id: aluno._id}, aluno, false);
      promise.then(function(doc) {
        vm.aluno = null;
        vm.findAlunos();
        alert.success("Aluno atualizado.");
      }, function(err) {
        utils.initContatos(aluno);
        console.log(err);
        alert.error("Ocorreu um problema ao tentar atualizar o aluno. (" + err + ")");
      });
    };
  
    vm.findAlunos = function() {
      var promise = dao.find(db.alunos, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.alunos = docs;
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
      });
    };
  
    vm.findAlunosByNome = function(nome) {
      var promise = dao.find(db.alunos, {nomeSearch: utils.newRegExp(nome)}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.alunos = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
      });
    };
  
    vm.findAlunoById = function(id) {
      var promise = dao.findOne(db.alunos, {_id: id});
      promise.then(function(doc) {
        vm.aluno = doc;
        utils.initContatos(vm.aluno);
        vm.findCursosByAluno(vm.aluno);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o aluno. (" + err + ")");
      });
    };
  
    vm.removeAluno = function(aluno) {
      if (!confirm('Tem certeza que deseja remover este aluno?')) {
        return;
      }
      var promise = dao.remove(db.alunos, {_id: aluno._id}, false);
      promise.then(function(count) {
        vm.aluno = null;
        vm.findAlunos();
        alert.success("Aluno removido.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar remover o aluno. (" + err + ")");
      });
    };
  
    vm.findCursosByAluno = function(aluno) {
      var promise = dao.find(db.cursos, {alunos: {$elemMatch: {_id: aluno._id}}}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        docs.forEach(function (curso) {
          for (var i = 0; i < curso.alunos.length; i++) {
            var alunoEmCurso = curso.alunos[i];
            if (alunoEmCurso._id == aluno._id) {
              utils.getSituacaoPlano(alunoEmCurso.plano, false);
              curso.aluno = alunoEmCurso;
              break;
            }
          }
        });
        vm.cursos = docs;
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
  });