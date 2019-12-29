app.controller('matriculas', function($scope, dao, users, alert, pager, utils) {
    var vm = this;
  
    $scope.$watch('vm.alunosSelected', function(newValue) {
      if (!vm.matricula) {
        return;
      }
      vm.matricula.aluno = utils.getIds(newValue)[0];
    }, true);
  
    $scope.$watch('vm.planosSelected', function(newValue) {
      if (!vm.matricula) {
        return;
      }
      var plano = angular.copy(newValue[0]);
      if (plano) {
        delete plano.label;
      }
      vm.matricula.plano = plano;
    }, true);
  
    vm.initMatriculas = function() {
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
  
    vm.createMatricula = function(curso) {
      var promise = dao.findOne(dao.db.cursos, {_id: curso._id});
      promise.then(function(doc) {
        vm.matricula = new Object();
        vm.curso = doc;
        vm.matricula.curso = doc._id;
        vm.findAlunosByCurso(doc);
        vm.findPlanosByCurso(doc);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o curso. (" + err + ")");
      });
    };
  
    vm.findCursos = function() {
      var hoje = utils.today();
      var promise = dao.find(dao.db.cursos, {$where: function () {
        return this.fim > hoje;
      }}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findCursosByNome = function(nome) {
      var hoje = utils.today();
      var promise = dao.find(dao.db.cursos, {$where: function () {
        return this.fim > hoje && utils.newRegExp(nome).test(this.nomeSearch);
      }}, {inicio: -1, fim: -1, nomeSearch: 1});
      promise.then(function(docs) {
        vm.cursos = docs;
        vm.setPage(1);
        vm.query = '';
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
      });
    };
  
    vm.findAlunosByCurso = function(curso) {
      vm.alunosSelected = [];
      vm.alunosOptions = [];
      vm.alunosEmCurso = [];
  
      var promise = dao.find(dao.db.alunos, {}, {nomeSearch: 1});
      promise.then(function(docs) {
        docs.forEach(function (aluno) {
          var alunoEmCurso = false;
          for (var i = 0; i < curso.alunos.length; i++) {
            var cursoAluno = curso.alunos[i];
            if (aluno._id == cursoAluno._id) {
              alunoEmCurso = true;
              aluno.curso = cursoAluno;
              aluno.contatos = vm.getContatos(aluno);
              utils.getSituacaoPlano(aluno.curso.plano, false);
  
              var promise = dao.findOne(dao.db.usuarios, {_id: aluno.curso.responsavel._id});
              promise.then(function(doc) {
                if (doc) {
                  aluno.curso.responsavel.nome = doc.nome;
                  aluno.curso.responsavel.active = true;
                }
              }, function(err) {
                console.log(err);
              });
  
              vm.alunosEmCurso.push(aluno);
              break;
            }
          }
          if (!alunoEmCurso) {
            vm.alunosOptions.push(aluno);
          }
        });
        vm.findCapacidadeByCurso(vm.alunosEmCurso.length, curso.capacidade);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
      });
    };
  
    vm.findPlanosByCurso = function(curso) {
      vm.planosSelected = [];
      vm.planosOptions = [{
        parcelas: null,
        valor: null,
        label: utils.getBolsaLabel()
      }];
  
      for (var i = 0; i < curso.planos.length; i++) {
        var plano = curso.planos[i];
        if (!plano.parcelas || !plano.valor) {
          continue;
        }
        vm.planosOptions.push({
          parcelas: plano.parcelas,
          valor: plano.valor,
          label: utils.getPlanoLabel(plano, true)
        });
      }
    };
  
    vm.findCapacidadeByCurso = function(current, max) {
      vm.capacidade = {
        current: current,
        max: max,
        p100: current * 100 / max
      }
  
      vm.capacidade.message = vm.capacidade.current + '/' + vm.capacidade.max + ' (' + utils.getDouble(vm.capacidade.p100, 0) + '%)';
  
      if (vm.capacidade.p100 < 75) {
        vm.capacidade.alert = 'info';
      } else if (vm.capacidade.p100 < 100) {
        vm.capacidade.alert = 'warning';
      } else {
        vm.capacidade.alert = 'danger';
      }
    };
  
    vm.saveMatricula = function(matricula) {
      var promise = dao.findOne(dao.db.cursos, {_id: matricula.curso});
      promise.then(function(doc) {
        var curso = doc;
        if (matricula.plano) {
          matricula.plano.pagamentos = [];
        }
        curso.alunos.push({
          _id: matricula.aluno,
          data: new Date(),
          plano: matricula.plano,
          observacao: matricula.observacao,
          responsavel: {
            _id:  users.getCurrent()._id,
            nome:  users.getCurrent().nome
          }
        });
        var promise = dao.update(dao.db.cursos, {_id: curso._id}, curso, false);
        promise.then(function(doc) {
          vm.createMatricula(doc);
          alert.success("Matrícula efetuada.");
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar efetuar a matrícula. (" + err + ")");
        });
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o curso. (" + err + ")");
      });
    };
  
    vm.removeMatricula = function(alunoId, cursoId) {
      if (!confirm('Tem certeza que deseja remover esta matrícula?')) {
        return;
      }
      var promise = dao.findOne(dao.db.cursos, {_id: cursoId});
      promise.then(function(doc) {
        var curso = doc;
        curso.alunos = curso.alunos.filter(function(aluno) {
          return aluno._id != alunoId;
        });
        var promise = dao.update(dao.db.cursos, {_id: curso._id}, curso, false);
        promise.then(function(doc) {
          vm.createMatricula(doc);
          alert.success("Matrícula removida.");
        }, function(err) {
          console.log(err);
          alert.error("Ocorreu um problema ao tentar remover a matrícula. (" + err + ")");
        });
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar o curso. (" + err + ")");
      });
    };
  
    vm.getContatos = function(aluno) {
      var contatos = {
        total: aluno.emails.length + aluno.telefones.length,
        first: null,
        others: [],
      }
      if (!contatos.total) {
        return contatos;
      }
      var isTelefoneFirst = false;
      if (aluno.telefones[0]) {
        contatos.first = aluno.telefones[0];
        isTelefoneFirst = true;
      } else {
        contatos.first = aluno.emails[0];
      }
      for (var i = 0 + isTelefoneFirst; i < aluno.telefones.length; i++) {
        contatos.others.push(aluno.telefones[i]);
      }
      for (var i = 0 + !isTelefoneFirst; i < aluno.emails.length; i++) {
        contatos.others.push(aluno.emails[i]);
      }
      return contatos;
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
  
    vm.singleSelectPlanoSettings = {
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
  