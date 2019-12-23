app.controller('cursos', function($scope, dao, pager, alert, utils) {
    var vm = this;
    var db = {};
  
    $scope.$watch('vm.professoresSelected', function(newValue) {
      if (!vm.curso) {
        return;
      }
      vm.curso.professores = utils.getIds(newValue);
    }, true);
  
    vm.newPlano = function() {
      return {parcelas: null, valor: null};
    }
  
    vm.initCursos = function() {
      db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
      db.professores = new Datastore({ filename: 'db/professores.db', autoload: true});
      vm.diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      vm.findCursos();
      vm.findProfessores();
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.cursos.length, page);
      vm.items = vm.cursos;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.cursos.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.createCurso = function(nome) {
      vm.curso = new Object();
      vm.curso.nome = nome;
      vm.curso.alunos = [];
      vm.curso.professores = [];
      vm.professoresSelected = [];
      vm.curso.planos = [vm.newPlano()];
    };
  
    vm.saveCurso = function(curso) {
      curso.nomeSearch = utils.normalize(curso.nome);
      curso.diasDaSemana = this.cleanUpDiasDaSemana(curso.diasDaSemana);
      curso.planos = this.cleanUpPlanos(curso.planos);
  
      if (curso._id) {
        vm.updateCurso(curso);
      } else {
        vm.insertCurso(curso);
      }
    };
  
    vm.insertCurso = function(curso) {
      var promise = dao.insert(db.cursos, curso);
      promise.then(function(doc) {
        vm.curso = null;
        vm.findCursos();
        alert.success("Curso cadastrado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar cadastrar o curso. (" + err + ")");
      });
    };
  
    vm.updateCurso = function(curso) {
      var promise = dao.update(db.cursos, {_id: curso._id}, curso, false);
      promise.then(function(doc) {
        vm.curso = null;
        vm.findCursos();
        alert.success("Curso atualizado.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar atualizar o curso. (" + err + ")");
      });
    };
  
    vm.findCursos = function() {
      var promise = dao.find(db.cursos, {}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findCursosByNome = function(nome) {
      var promise = dao.find(db.cursos, {nomeSearch: utils.newRegExp(nome)}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findCursoById = function(id) {
      var promise = dao.findOne(db.cursos, {_id: id});
      promise.then(function(doc) {
        vm.curso = doc;
        vm.professoresSelected = vm.professoresOptions.filter(function(p) {
          return vm.curso.professores.includes(p._id);
        });
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o curso. (" + err + ")");
      });
    };
  
    vm.removeCurso = function(curso) {
      if (!confirm('Tem certeza que deseja remover este curso?')) {
        return;
      }
      var promise = dao.remove(db.cursos, {_id: curso._id}, false);
      promise.then(function(count) {
        vm.curso = null;
        vm.findCursos();
        alert.success("Curso removido.");
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar remover este curso. (" + err + ")");
      });
    };
  
    vm.findProfessores = function() {
      var promise = dao.find(db.professores, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.professoresOptions = docs;
        vm.professoresSelected = [];
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os professores. (" + err + ")");
      });
    };
  
    vm.isDiasDaSemanaInvalid = function(diasDaSemana) {
      if (!diasDaSemana) {
        return true;
      }
      for (var i = 0; i < 7; i++) {
        if (diasDaSemana[i]) {
          return false;
        }
      }
      return true;
    };
  
    vm.cleanUpDiasDaSemana = function(diasDaSemana) {
      if (!diasDaSemana) {
        return diasDaSemana;
      }
      for (var i = 0; i < 7; i++) {
        if (!diasDaSemana[i]) {
          delete diasDaSemana[i];
        }
      }
      return diasDaSemana;
    };
  
    vm.cleanUpPlanos = function(planos) {
      var planosToSave = [];
      for (var i = 0; i < planos.length; i++) {
        if (planos[i].parcelas && planos[i].valor) {
          planosToSave.push(planos[i]);
        }
      }
      if (planosToSave.length){
        return planosToSave;
      }
      return [this.newPlano()];
    };
  
    vm.calculateCargaTotal = function(curso) {
      if (!curso.inicio || !curso.fim || !curso.cargaHoraria || vm.isDiasDaSemanaInvalid(curso.diasDaSemana)) {
        curso.cargaTotal = '';
        return;
      }
  
      var cargaTotal = 0;
      for (var d = new Date(curso.inicio); d <= curso.fim; d.setDate(d.getDate() + 1)) {
        if (curso.diasDaSemana[d.getDay()]) {
          cargaTotal += curso.cargaHoraria;
        }
      }
      if (cargaTotal == 0) {
        curso.cargaTotal = '';
        return;
      }
      curso.cargaTotal = cargaTotal;
    };
  
    vm.professoresSettings = {
      displayProp: 'nome',
      searchField: 'nomeSearch',
      enableSearch: true,
      clearSearchOnClose: true,
      scrollable: true,
      scrollableHeight: 'auto',
      selectionLimit: 0,
      closeOnSelect: true,
      closeOnDeselect: true,
      showCheckAll: false,
      showUncheckAll: false,
      selectedToTop: true,
      smartButtonMaxItems: 3,
    };
  
  });