app.controller('pagamentos', function($scope, dao, pager, alert, utils) {
    var vm = this;
  
    $scope.$watch('vm.alunosSelected', function(newValue) {
      if (!vm.pagamento) {
        return;
      }
      var aluno = angular.copy(newValue[0]);
      vm.pagamento.aluno = aluno;
      if (aluno) {
        if (aluno.curso.plano.valorRemanescente == 0) {
          vm.pagamento.valor = null;
        } else if (aluno.curso.plano.valorRemanescente < aluno.curso.plano.valor) {
          vm.pagamento.valor = aluno.curso.plano.valorRemanescente;
        } else {
          vm.pagamento.valor = aluno.curso.plano.valor;
        }
      }
    }, true);
  
    $scope.$watch('vm.meiosSelected', function(newValue) {
      if (!vm.pagamento) {
        return;
      }
      vm.pagamento.meio = utils.getIds(newValue)[0];
    }, true);
  
    vm.initPagamentos = function() {
      vm.findCursos();
    };
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.cursos.length, page);
      vm.items = vm.cursos;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.cursos.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };
  
    vm.createPagamento = function(curso, alunoSelected) {
      vm.meiosSelected = [];
      var promise = dao.findOne(dao.db.cursos, {_id: curso._id});
      promise.then(function(doc) {
        vm.pagamento = new Object();
        vm.pagamento.curso = doc;
        vm.findAlunosByCurso(doc, alunoSelected);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o curso. (" + err + ")");
      });
    };
  
    vm.findCursos = function() {
      var hoje = utils.today();
      var promise = dao.find(dao.db.cursos, {}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findCursosByNome = function(nome) {
      var promise = dao.find(dao.db.cursos, {nomeSearch: utils.newRegExp(nome)}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findAlunosByCurso = function(curso, alunoSelected) {
      vm.alunosSelected = [];
      vm.alunosOptions = [];
  
      var promise = dao.find(dao.db.alunos, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        docs.forEach(function (aluno) {
          var alunoEmCurso = false;
          for (var i = 0; i < curso.alunos.length; i++) {
            var cursoAluno = curso.alunos[i];
            if (aluno._id == cursoAluno._id) {
              alunoEmCurso = true;
  
              aluno.curso = cursoAluno;
              utils.getSituacaoPlano(aluno.curso.plano, true);
  
              aluno.curso.plano.pagamentos.forEach(function (pagamento) {
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
  
              break;
            }
          }
          if (alunoEmCurso) {
            vm.alunosOptions.push(aluno);
            if (alunoSelected && aluno._id == alunoSelected._id) {
              vm.alunosSelected.push(aluno);
            }
          }
        });
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
      });
    };
  
    vm.savePagamento = function(pagamento) {
      if (!confirm('Confirma o recebimento de ' + utils.getReais(pagamento.valor)
          + ' em '+ utils.meiosOptions[pagamento.meio].label +'?')) {
        return;
      }
  
      var promise = dao.findOne(dao.db.cursos, {_id: pagamento.curso._id});
      promise.then(function(doc) {
        var curso = doc;
        var aluno = curso.alunos.filter(function(aluno) {
          return aluno._id == pagamento.aluno._id;
        })[0];
  
        var data = new Date();
  
        aluno.plano.pagamentos.push({
          valor: pagamento.valor,
          meio: pagamento.meio,
          data: data,
          observacao: pagamento.observacao,
          responsavel: {
            _id:  utils.getCurrentUser()._id,
            nome:  utils.getCurrentUser().nome
          }
        });
  
        var promise = dao.update(dao.db.cursos, {_id: curso._id}, curso, false);
        promise.then(function(doc) {
          vm.createPagamento(doc, aluno);
          alert.success("Pagamento efetuado.");
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar efetuar a pagamento. (" + err + ")");
        });
  
        var pagamentoLog = {
          aluno: {
            _id:  pagamento.aluno._id,
            nome:  pagamento.aluno.nome,
          },
          valor: pagamento.valor,
          meio: pagamento.meio,
          curso: {
            _id:  pagamento.curso._id,
            nome:  pagamento.curso.nome,
          },
          data: data,
          observacao: pagamento.observacao,
          responsavel: {
            _id:  utils.getCurrentUser()._id,
            nome:  utils.getCurrentUser().nome
          }
        };
  
        var promise = dao.insert(dao.db.pagamentos, pagamentoLog);
        promise.then(function(doc) {
          console.log('Log de pagamento registrado.');
        }, function(err) {
          console.log("Erro ao registrar log de pagamento. (" + err + ")");
        });
  
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o aluno. (" + err + ")");
      });
    };
  
    vm.getPagamentoInfo = function(plano) {
      var valorPago = utils.getValorPago(plano);
      var valorEsperado = utils.getValorEsperado(plano);
      var valorRemanescente = valorEsperado - valorPago;
  
      var info = "<strong>Valor total pago:</strong> " + utils.getReais(valorPago);
      if (valorRemanescente > 0) {
        info += "<br/><strong>Remanescente:</strong> " + utils.getReais(valorRemanescente);
      }
      return utils.trustAsHtml(info);
    };
  
    vm.singleSelectAlunoSettings = {
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
  