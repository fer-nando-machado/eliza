app.controller('professores', function (db, dao, pager, alert, utils) {
  var vm = this;

  vm.initProfessores = function () {
    /*
    var promise = dao.ensureUniqueIndex(db.professores, 'cpf');
    promise.then(function() {
      console.log('Unique constraint professores.cpf ativada com sucesso.');
    }, function(err) {
      console.log('Erro ao criar unique constraint.');
      console.log(err);
    });
    */
    vm.findProfessores();
  };
  vm.setPage = function (page) {
    vm.pager = pager.getPager(vm.professores.length, page);
    vm.items = vm.professores;
    if (vm.pager.totalItems == 0) {
      return;
    }
    vm.items = vm.professores.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
  };
  vm.createProfessor = function (nome) {
    vm.professor = new Object();
    vm.professor.nome = nome;
    utils.initContatos(vm.professor);
  };
  vm.saveProfessor = function (professor) {
    professor.nomeSearch = utils.normalize(professor.nome);
    professor.telefones = utils.removeDuplicates(professor.telefones);
    professor.emails = utils.removeDuplicates(professor.emails);
    if (professor._id) {
      vm.updateProfessor(professor);
    }
    else {
      vm.insertProfessor(professor);
    }
  };
  vm.insertProfessor = function (professor) {
    var promise = dao.insert(db.professores, professor);
    promise.then(function (doc) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor cadastrado.");
    }, function (err) {
      utils.initContatos(professor);
      console.log(err);
      alert.error("Ocorreu um problema ao tentar cadastrar o professor. (" + err + ")");
    });
  };
  vm.updateProfessor = function (professor) {
    var promise = dao.update(db.professores, { _id: professor._id }, professor, false);
    promise.then(function (doc) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor atualizado.");
    }, function (err) {
      utils.initContatos(professor);
      console.log(err);
      alert.error("Ocorreu um problema ao tentar atualizar o professor. (" + err + ")");
    });
  };
  vm.findProfessores = function () {
    var promise = dao.find(db.professores, {}, { nomeSearch: 1 });
    promise.then(function (docs) {
      vm.professores = docs;
      vm.setPage(1);
    }, function (err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os professores. (" + err + ")");
    });
  };
  vm.findProfessoresByNome = function (nome) {
    var promise = dao.find(db.professores, { nomeSearch: utils.newRegExp(nome) }, { nomeSearch: 1 });
    promise.then(function (docs) {
      vm.professores = docs;
      vm.setPage(1);
      vm.query = '';
    }, function (err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os professores. (" + err + ")");
    });
  };
  vm.findProfessorById = function (id) {
    var promise = dao.findOne(db.professores, { _id: id });
    promise.then(function (doc) {
      vm.professor = doc;
      utils.initContatos(vm.professor);
    }, function (err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar o professor. (" + err + ")");
    });
  };
  vm.removeProfessor = function (professor) {
    if (!confirm('Tem certeza que deseja remover este professor?')) {
      return;
    }
    var promise = dao.remove(db.professores, { _id: professor._id }, false);
    promise.then(function (count) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor removido.");
    }, function (err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar remover o professor. (" + err + ")");
    });
  };
});
