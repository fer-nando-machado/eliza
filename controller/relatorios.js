app.controller('relatorios', function($scope, dao, pager, alert, utils) {
    var vm = this;
  
    $scope.$watch('vm.alunosSelected', function(newValue) {
      if (!vm.query) {
        return;
      }
      vm.query.aluno = utils.getIds(newValue)[0];
    }, true);
  
    $scope.$watch('vm.cursosSelected', function(newValue) {
      if (!vm.query) {
        return;
      }
      vm.query.curso = utils.getIds(newValue)[0];
    }, true);
  
    $scope.$watch('vm.usuariosSelected', function(newValue) {
      if (!vm.query) {
        return;
      }
      vm.query.responsavel = utils.getIds(newValue)[0];
    }, true);
  
    $scope.$watch('vm.meiosSelected', function(newValue) {
      if (!vm.query) {
        return;
      }
      vm.query.meio = utils.getIds(newValue)[0];
    }, true);
  
    vm.initRelatorios = function() {
      vm.resetQuery(true);
  
      vm.findAlunos();
      vm.findCursos();
      vm.findUsuarios();
      vm.findPagamentos();
    };
  
    vm.resetQuery = function(currentMonth) {
      vm.usuariosSelected = [];
      vm.cursosSelected = [];
      vm.alunosSelected = [];
      vm.meiosSelected = [];
      var hoje = utils.today();
      vm.query = {
        startDate: currentMonth ? utils.startOfMonth(hoje) : null,
        endDate: currentMonth ? utils.endOfMonth(hoje) : null,
      };
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.pagamentos.length, page);
      vm.items = vm.pagamentos;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.pagamentos.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.findPagamentos = function() {
      var query = {};
  
      if (vm.query.startDate && vm.query.endDate) {
        query['data'] = {
          $lte : utils.addDays(vm.query.endDate, 1),
          $gte : vm.query.startDate
        };
      } else if (vm.query.startDate) {
        vm.query.endDate = null;
        query['data'] = {
          $gte : vm.query.startDate
        };
      } else if (vm.query.endDate) {
        vm.query.startDate = null;
        query['data'] = {
          $lte : utils.addDays(vm.query.endDate, 1)
        };
      }
  
      if (vm.query.aluno) {
        query['aluno._id'] = vm.query.aluno;
      }
      if (vm.query.curso) {
        query['curso._id'] = vm.query.curso;
      }
      if (vm.query.meio != null) {
        query['meio'] = vm.query.meio;
      }
      if (vm.query.responsavel) {
        query['responsavel._id'] = vm.query.responsavel;
      }
  
      var promise = dao.find(dao.db.pagamentos, query, {data: 1});
      promise.then(function(docs) {
        vm.pagamentos = docs;
        vm.valorTotal = 0;
  
        vm.pagamentos.forEach(function (pagamento) {
          vm.valorTotal+=pagamento.valor;
  
          var promise = dao.findOne(dao.db.alunos, {_id: pagamento.aluno._id});
          promise.then(function(doc) {
            if (doc) {
              pagamento.aluno.nome = doc.nome;
              pagamento.aluno.active = true;
            }
          }, function(err) {
            console.log(err);
          });
  
          var promise = dao.findOne(dao.db.cursos, {_id: pagamento.curso._id});
          promise.then(function(doc) {
            if (doc) {
              pagamento.curso.nome = doc.nome;
              pagamento.curso.active = true;
            }
          }, function(err) {
            console.log(err);
          });
  
          var promise = dao.findOne(dao.db.usuarios, {_id: pagamento.responsavel._id});
          promise.then(function(doc) {
            if (doc) {
              pagamento.responsavel.nome = doc.nome;
              pagamento.responsavel.active = true;
            }
          }, function(err) {
            console.log(err);
          });
  
        });
  
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os pagamentos. (" + err + ")");
      });
    };
  
    vm.findAlunos = function() {
      vm.alunosOptions = [];
      var promise = dao.find(dao.db.alunos, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.alunosOptions = docs;
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
      });
    };
  
    vm.findCursos = function() {
      vm.cursosOptions = [];
      var promise = dao.find(dao.db.cursos, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursosOptions = docs;
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findUsuarios = function() {
      vm.usuariosOptions = [];
      var promise = dao.find(dao.db.usuarios, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        vm.usuariosOptions = docs;
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
      });
    };
  
    vm.singleSelectSettings = {
      displayProp: 'nome',
      searchField: 'nomeSearch',
      enableSearch: true,
      clearSearchOnClose: true,
      scrollable: true,
      scrollableHeight: 'auto',
      selectionLimit: 1,
      closeOnSelect: true,
      closeOnDeselect: true,
      showCheckAll: false,
      showUncheckAll: false,
      selectedToTop: true,
      smartButtonMaxItems: 1
    };
  
    vm.singleSelectMeioSettings = {
      displayProp: 'label',
      enableSearch: false,
      clearSearchOnClose: true,
      scrollable: true,
      scrollableHeight: 'auto',
      selectionLimit: 1,
      closeOnSelect: true,
      closeOnDeselect: true,
      showCheckAll: false,
      showUncheckAll: false,
      selectedToTop: false,
      smartButtonMaxItems: 1
    };
  
  });