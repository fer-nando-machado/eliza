var app = angular.module('eliza', ['ngRoute', 'ngMessages', 'ngMask', 'angularjs-dropdown-multiselect']);

var CONFIG = {};
var USER = null;

app.config(function ($routeProvider) {
  $routeProvider.
    when('/login', {
      templateUrl: 'views/login.html'
    }).
    when('/agenda', {
      templateUrl: 'views/agenda.html'
    }).
    when('/alunos', {
      templateUrl: 'views/alunos.html'
    }).
    when('/professores', {
      templateUrl: 'views/professores.html',
    }).
    when('/cursos', {
      templateUrl: 'views/cursos.html'
    }).
    when('/matriculas', {
      templateUrl: 'views/matriculas.html'
    }).
    when('/pagamentos', {
      templateUrl: 'views/pagamentos.html'
    }).
    when('/relatorios', {
      templateUrl: 'views/relatorios.html',
    }).
    when('/config', {
      templateUrl: 'views/config.html',
    }).
    when('/credits', {
      templateUrl: 'views/credits.html',
    }).
    when('/usuarios', {
      templateUrl: 'views/usuarios.html',
    }).
    otherwise({
      redirectTo: '/login'
    });
});

app.factory('utils', function($filter, $sce) {
  return {
    i18nMultiSelect: {
      checkAll: 'Selecionar tudo',
      uncheckAll: 'Limpar seleção',
      enableSearch: 'Habilitar busca',
      disableSearch: 'Desabilitar busca',
      selectionCount: 'selecionado(s)',
      selectionOf: '/',
      searchPlaceholder: 'Buscar...',
      buttonDefaultText: 'Selecionar...',
      dynamicButtonTextSuffix: 'selecionado(s)',
      selectGroup: 'Selecionar tudo:'
    },
    meiosOptions: [
      {_id: 0, label: 'Dinheiro'},
      {_id: 1, label: 'Cartão de Crédito'},
      {_id: 2, label: 'Cartão de Débito'},
      {_id: 3, label: 'Cheque'}
    ],
    levelOptions: [
      'Root', 'Administrador', 'Operador'
    ],
    isAdmin: function() {
      if (USER.level == "0" || USER.level == "1") {
        return true;
      }
      return false;
    },
    getCurrentUser: function() {
      return USER;
    },
    estados: ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'],
    getMeiosLabel: function(id) {
      for (var i = 0; i < meiosOptions.length; i++) {
        if (meiosOptions[i]._id == id) {
          return meiosOptions[i].label;
        }
      }
      return '';
    },
    addElement: function(array, element) {
      array.push(element);
    },
    removeElement: function(array, i) {
      array.splice(i, 1);
    },
    removeDuplicates: function (array) {
      var set = Array.from(new Set(array));
      set = set.filter(function(item) {
        return !!item
      });
      return set;
    },
    initContatos: function (pessoa) {
      if (!pessoa.telefones || !pessoa.telefones.length) {
        pessoa.telefones = [''];
      }
      if (!pessoa.emails || !pessoa.emails.length) {
        pessoa.emails = [''];
      }
    },
    normalize: function(str) {
      if (!str) {
        return '';
      }
      return Normalizer(str).toLowerCase();
    },
    newRegExp: function(str) {
      return new RegExp(this.normalize(str),"i");
    },
    getCursoStatus: function(curso, dia) {
      if (dia < curso.inicio) {
        return 1;
      }
      if (dia > curso.fim) {
        return -1;
      }
      return 0;
    },
    getCursoStatusLabel: function(curso) {
      var status = this.getCursoStatus(curso, this.today());
      if (status < 0) {
        return "Encerrado";
      }
      if (status > 0) {
        return "Programado";
      }
      return "Ativo";
    },
    today: function () {
      var today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    },
    startOfMonth: function(date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    endOfMonth: function(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },
    addDays: function(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    getNascimentoMaxLimit: function () {
      var today = this.today();
      return new Date(today.getFullYear()-1, today.getMonth(), today.getDate());
    },
    getInicioMaxLimit: function(fim) {
      if (!fim) {
        return new Date(3000, 11, 31);
      }
      return fim;
    },
    getFimMinLimit: function(inicio) {
      if (!inicio) {
        return new Date(new Date().getFullYear(), 0, 1);
      }
      return inicio;
    },
    getRandom: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getReais: function(valor) {
      return $filter('currency')(valor, 'R$');
    },
    getDouble: function(value, size) {
      return $filter('number')(value, size);
    },
    getPlanoLabel: function(plano, displayTotal) {
      if (!plano.parcelas || !plano.valor) {
        return this.getBolsaLabel();
      }
      var planoString = plano.parcelas + "x " + this.getReais(plano.valor);
      if (plano.parcelas == 1 || !displayTotal) {
        return planoString;
      }
      return planoString + " (" + this.getReais(plano.parcelas * plano.valor) + ")";
    },
    getValorPago: function(plano) {
      var valorPago = 0;
      for (var i = 0; i < plano.pagamentos.length; i++) {
        valorPago += plano.pagamentos[i].valor;
      }
      return valorPago;
    },
    getValorEsperado: function(plano) {
      return plano.valor * plano.parcelas;
    },
    getSituacaoPlano: function(plano, displayTotal) {
      plano.label = this.getPlanoLabel(plano, displayTotal);
      plano.valorPago = this.getValorPago(plano);
      plano.valorEsperado = this.getValorEsperado(plano);
      plano.valorRemanescente = plano.valorEsperado - plano.valorPago;
      if (plano.valorRemanescente < 0) {
        plano.valorRemanescente = 0;
      }
      plano.situacao = plano.valorRemanescente > 0 ? "Pendente" : "Quitado";
    },
    getBolsaLabel: function() {
      return "Bolsista";
    },
    getIds: function(array) {
      var ids = [];
      array.forEach(function(element) {
        ids.push(element._id);
      });
      return ids;
    },
    encrypt: function(string) {
      return window.btoa(string);
    },
    decrypt: function(string) {
      return window.atob(string);
    },
    trustAsHtml: function(string) {
      return $sce.trustAsHtml(string);
    }
  };
});

app.service('alert', function ($rootScope, $timeout, utils) {
  this.alertMessage = function (message, type) {
    var promise = $timeout(function () {
      if ($rootScope.alert) {
        $rootScope.alert.dismiss();
      }
    }, 3000);

    return {
      message: utils.trustAsHtml(message),
      type: type,
      visible: true,
      promise: promise,
      dismiss: function () {
        $timeout.cancel($rootScope.alert.promise);
        $rootScope.alert = {};
      }
    };
  };

  this.success = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Sucesso!</strong> " + message, "alert-success");
  };
  this.info = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Aviso!</strong> " + message, "alert-info");
  };
  this.warning = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Atenção!</strong> " + message, "alert-warning");
  };
  this.error = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Erro!</strong> " + message, "alert-danger");
  };
});

app.service('dao', function($q) {
  this.find = function(target, query, sort) {
    let deferred = $q.defer();
    target.find(query).sort(sort).exec(function(err, doc) {
      err ? deferred.reject(err) : deferred.resolve(doc);
    });
    return deferred.promise;
  };

  this.findOne = function(target, query) {
    let deferred = $q.defer();
    target.findOne(query, function(err, docs) {
      err ? deferred.reject(err) : deferred.resolve(docs);
    });
    return deferred.promise;
  };

  this.insert = function(target, doc) {
    let deferred = $q.defer();
    target.insert(doc, function(err, newDoc) {
      err ? deferred.reject(err) : deferred.resolve(newDoc);
    });
    return deferred.promise;
  };

  this.update = function(target, query, update, multi) {
    let deferred = $q.defer();
    target.update(query, update, {multi: multi, upsert: false, returnUpdatedDocs: true}, function(err, numAffected, affectedDocuments, upsert) {
      err ? deferred.reject(err) : deferred.resolve(affectedDocuments);
    });
    return deferred.promise;
  };

  this.remove = function(target, query, multi) {
    let deferred = $q.defer();
    target.remove(query, {multi: multi}, function(err, count) {
      err ? deferred.reject(err) : deferred.resolve(count);
    });
    return deferred.promise;
  };

  this.ensureUniqueIndex = function(target, field) {
    let deferred = $q.defer();
    target.ensureIndex({ fieldName: field, unique: true }, function (err) {
      err ? deferred.reject(err) : deferred.resolve();
    });
    return deferred.promise;
  };

});

app.service('pager', function() {
  // service implementation
  this.getPager = function(totalItems, currentPage) {
    // default to first page
    currentPage = currentPage || 1;

    // default page size is 10
    var pageSize = CONFIG.pageSize || 10;

    // calculate total pages
    var totalPages = Math.ceil(totalItems / pageSize) || 1;
    var startPage = 1;
    var endPage = totalPages;

    // calculate start and end item indexes
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      isFirstPage: function () {
        return currentPage == 1;
      },
      isLastPage: function () {
        return currentPage == totalPages;
      },
      hasPagination: function () {
        return true;//totalPages > 1;
      }
    };
  }
});

app.directive('pager', function () {
  return {
    require: 'vm',
    scope: {
      vm: '='
    },
    restrict: 'E',
    templateUrl: 'views/pager.html',
  };
});

app.directive('legacy', function () {
  return {
    require: 'vm',
    scope: {
      legacy: '=',
      value: '=',
    },
    restrict: 'E',
    template: '<span ng-class="{legacy: legacy}">{{value}} <span class="glyphicon glyphicon-hourglass small" ng-if="legacy"></span></span>'
  };
});

app.controller('header', function($location) {
  var vm = this;

  vm.go = function(path) {
    $location.path(path);
  };

  vm.isActive = function(path) {
    return $location.path() == '/'+path;
  };
});

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
        USER = doc;
      }
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema durante a autenticação. (" + err + ")");
    });
  };

  vm.logout = function() {
    alert.info("Encerrando sessão de " + USER.login + ".");
    USER = null;
  };

  vm.go = function(path) {
    $location.path(path);
  };

});

app.controller('agenda', function($scope, dao, utils) {
  var vm = this;
  var db = {};

  vm.initAgenda = function() {
    db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
    vm.escopo = utils.today();
    this.loadCalendario();
  };

  vm.loadCalendario = function() {
    var inicio = utils.startOfMonth(vm.escopo);
    inicio.setDate(inicio.getDate() - inicio.getDay());
    var fim = utils.endOfMonth(vm.escopo);
    fim.setDate(fim.getDate() + 6 - fim.getDay());

    var promise = dao.find(db.cursos, {$where: function () {
      return (!(this.inicio < inicio && this.inicio < fim && this.fim < inicio && this.fim < fim) &&
      !(this.inicio > inicio && this.inicio > fim && this.fim > inicio && this.fim > fim));
    }}, {horario:1, nomeSearch:1});
    promise.then(function(docs) {
      vm.calendario = [];
      var semana = [];
      for (var d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        if (d.getHours() != 0) {
          d.setHours(0);
        }
        semana.push({
          data: new Date(d),
          isEscopoAtual: d.getMonth() == vm.escopo.getMonth(),
          cursos: docs.filter(function(curso) {
            return curso.diasDaSemana[d.getDay()] && utils.getCursoStatus(curso, d) == 0;
          })
        });
        if (d.getDay() == 6) {
          vm.calendario.push(semana);
          semana = [];
        }
      }
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
    });
  };

  vm.previousEscopo = function(escopo) {
    vm.escopo = new Date(vm.escopo.getFullYear(), vm.escopo.getMonth() - 1, 1);
    this.loadCalendario();
  };

  vm.nextEscopo = function() {
    vm.escopo = new Date(vm.escopo.getFullYear(), vm.escopo.getMonth() + 1, 1);
    this.loadCalendario();
  };
});

app.controller('config', function($scope, dao, alert) {
  var vm = this;
  var db = {};

  vm.initConfig = function() {
    db.config = new Datastore({ filename: 'db/config.db', autoload: true});
    vm.loadConfig();
  };

  vm.loadConfig = function() {
    var promise = dao.findOne(db.config);
    promise.then(function(doc) {
      vm.config = doc;
      if (!vm.config.pageSize) {
        vm.config.pageSize = 10;
      }
    }, function(err) {
      console.log(err);
    });
  };

  vm.saveConfig = function(config) {
    if (config._id) {
      vm.updateConfig(config);
    } else {
      vm.insertConfig(config);
    }
  };

  vm.insertConfig = function(config) {
    var promise = dao.insert(db.config, config);
    promise.then(function(doc) {
      vm.config = doc;
      CONFIG = doc;
      alert.success("Configurações atualizadas.");
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
    });
  };

  vm.updateConfig = function(config) {
    var promise = dao.update(db.config, {_id: config._id}, config, false);
    promise.then(function(doc) {
      vm.config = doc;
      CONFIG = doc;
      alert.success("Configurações atualizadas.");
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao atualizar as configurações. (" + err + ")");
    });
  };
});

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

app.controller('professores', function($scope, dao, pager, alert, utils) {
  var vm = this;
  var db = {};

  vm.initProfessores = function() {
    db.professores = new Datastore({ filename: 'db/professores.db', autoload: true});
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

  vm.setPage = function(page) {
    vm.pager = pager.getPager(vm.professores.length, page);
    vm.items = vm.professores;
    if (vm.pager.totalItems == 0) {
      return;
    }
    vm.items = vm.professores.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
  };

  vm.createProfessor = function(nome) {
    vm.professor = new Object();
    vm.professor.nome = nome;
    utils.initContatos(vm.professor);
  };

  vm.saveProfessor = function(professor) {
    professor.nomeSearch = utils.normalize(professor.nome);
    professor.telefones = utils.removeDuplicates(professor.telefones);
    professor.emails = utils.removeDuplicates(professor.emails);

    if (professor._id) {
      vm.updateProfessor(professor);
    } else {
      vm.insertProfessor(professor);
    }
  };

  vm.insertProfessor = function(professor) {
    var promise = dao.insert(db.professores, professor);
    promise.then(function(doc) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor cadastrado.");
    }, function(err) {
      utils.initContatos(professor);
      console.log(err);
      alert.error("Ocorreu um problema ao tentar cadastrar o professor. (" + err + ")");
    });
  };

  vm.updateProfessor = function(professor) {
    var promise = dao.update(db.professores, {_id: professor._id}, professor, false);
    promise.then(function(doc) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor atualizado.");
    }, function(err) {
      utils.initContatos(professor);
      console.log(err);
      alert.error("Ocorreu um problema ao tentar atualizar o professor. (" + err + ")");
    });
  };

  vm.findProfessores = function() {
    var promise = dao.find(db.professores, {}, {nomeSearch: 1});
    promise.then(function(docs) {
      vm.professores = docs;
      vm.setPage(1);
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os professores. (" + err + ")");
    });
  };

  vm.findProfessoresByNome = function(nome) {
    var promise = dao.find(db.professores, {nomeSearch: utils.newRegExp(nome)}, {nomeSearch: 1});
    promise.then(function(docs) {
      vm.professores = docs;
      vm.setPage(1);
      vm.query = '';
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os professores. (" + err + ")");
    });
  };

  vm.findProfessorById = function(id) {
    var promise = dao.findOne(db.professores, {_id: id});
    promise.then(function(doc) {
      vm.professor = doc;
      utils.initContatos(vm.professor);
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar o professor. (" + err + ")");
    });
  };

  vm.removeProfessor = function(professor) {
    if (!confirm('Tem certeza que deseja remover este professor?')) {
      return;
    }
    var promise = dao.remove(db.professores, {_id: professor._id}, false);
    promise.then(function(count) {
      vm.professor = null;
      vm.findProfessores();
      alert.success("Professor removido.");
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar remover o professor. (" + err + ")");
    });
  };
});

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

app.controller('matriculas', function($scope, dao, alert, pager, utils) {
  var vm = this;
  var db = {};

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
    db.alunos = new Datastore({ filename: 'db/alunos.db', autoload: true});
    db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
    db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
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
    var promise = dao.findOne(db.cursos, {_id: curso._id});
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
    var promise = dao.find(db.cursos, {$where: function () {
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
    var promise = dao.find(db.cursos, {$where: function () {
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

    var promise = dao.find(db.alunos, {}, {nomeSearch: 1});
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

            var promise = dao.findOne(db.usuarios, {_id: aluno.curso.responsavel._id});
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
    var promise = dao.findOne(db.cursos, {_id: matricula.curso});
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
          _id:  utils.getCurrentUser()._id,
          nome:  utils.getCurrentUser().nome
        }
      });
      var promise = dao.update(db.cursos, {_id: curso._id}, curso, false);
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
    var promise = dao.findOne(db.cursos, {_id: cursoId});
    promise.then(function(doc) {
      var curso = doc;
      curso.alunos = curso.alunos.filter(function(aluno) {
        return aluno._id != alunoId;
      });
      var promise = dao.update(db.cursos, {_id: curso._id}, curso, false);
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

app.controller('pagamentos', function($scope, dao, pager, alert, utils) {
  var vm = this;
  var db = {};

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
    db.alunos = new Datastore({ filename: 'db/alunos.db', autoload: true});
    db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
    db.pagamentos = new Datastore({ filename: 'db/pagamentos.db', autoload: true});
    db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
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
    var promise = dao.findOne(db.cursos, {_id: curso._id});
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

  vm.findAlunosByCurso = function(curso, alunoSelected) {
    vm.alunosSelected = [];
    vm.alunosOptions = [];

    var promise = dao.find(db.alunos, {}, {nomeSearch: 1});
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
              var promise = dao.findOne(db.usuarios, {_id: pagamento.responsavel._id});
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

    var promise = dao.findOne(db.cursos, {_id: pagamento.curso._id});
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

      var promise = dao.update(db.cursos, {_id: curso._id}, curso, false);
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

      var promise = dao.insert(db.pagamentos, pagamentoLog);
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

app.controller('usuarios', function($scope, dao, pager, alert, utils) {
  var vm = this;
  var db = {};

  vm.initUsuarios = function() {
    db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
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

  vm.insertUsuario = function(usuario) {
    var promise = dao.insert(db.usuarios, usuario);
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
    var promise = dao.update(db.usuarios, {_id: usuario._id}, usuario, false);
    promise.then(function(doc) {
      if (USER._id == doc._id) {
        USER = doc;
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
    if (utils.isAdmin()) {
      var promise = dao.find(db.usuarios, {"level": {$gt: "0"}}, {loginSearch: 1});
      promise.then(function(docs) {
        vm.usuarios = docs;
        vm.setPage(1);
      }, function(err) {
        console.log(err);
        alert.error("Ocorreu um problema ao tentar buscar os usuários. (" + err + ")");
      });
    } else {
      var promise = dao.find(db.usuarios, {"_id": USER._id}, {});
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
    var promise = dao.find(db.usuarios, {loginSearch: utils.newRegExp(login), "level": {$gt: "0"}}, {loginSearch: 1});
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
    var promise = dao.findOne(db.usuarios, {_id: id});
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
    var promise = dao.remove(db.usuarios, {_id: usuario._id}, false);
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

app.controller('relatorios', function($scope, dao, pager, alert, utils) {
  var vm = this;
  var db = {};

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
    db.alunos = new Datastore({ filename: 'db/alunos.db', autoload: true});
    db.cursos = new Datastore({ filename: 'db/cursos.db', autoload: true});
    db.usuarios = new Datastore({ filename: 'db/usuarios.db', autoload: true});
    db.pagamentos = new Datastore({ filename: 'db/pagamentos.db', autoload: true});

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

    var promise = dao.find(db.pagamentos, query, {data: 1});
    promise.then(function(docs) {
      vm.pagamentos = docs;
      vm.valorTotal = 0;

      vm.pagamentos.forEach(function (pagamento) {
        vm.valorTotal+=pagamento.valor;

        var promise = dao.findOne(db.alunos, {_id: pagamento.aluno._id});
        promise.then(function(doc) {
          if (doc) {
            pagamento.aluno.nome = doc.nome;
            pagamento.aluno.active = true;
          }
        }, function(err) {
          console.log(err);
        });

        var promise = dao.findOne(db.cursos, {_id: pagamento.curso._id});
        promise.then(function(doc) {
          if (doc) {
            pagamento.curso.nome = doc.nome;
            pagamento.curso.active = true;
          }
        }, function(err) {
          console.log(err);
        });

        var promise = dao.findOne(db.usuarios, {_id: pagamento.responsavel._id});
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
    var promise = dao.find(db.alunos, {}, {nomeSearch: 1});
    promise.then(function(docs) {
      vm.alunosOptions = docs;
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os alunos. (" + err + ")");
    });
  };

  vm.findCursos = function() {
    vm.cursosOptions = [];
    var promise = dao.find(db.cursos, {}, {nomeSearch: 1});
    promise.then(function(docs) {
      vm.cursosOptions = docs;
    }, function(err) {
      console.log(err);
      alert.error("Ocorreu um problema ao tentar buscar os cursos. (" + err + ")");
    });
  };

  vm.findUsuarios = function() {
    vm.usuariosOptions = [];
    var promise = dao.find(db.usuarios, {}, {nomeSearch: 1});
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

app.filter('age', function() {
  return function(date) {
    if (!date) {
      return '';
    }
    var idade = Math.abs(new Date(Date.now() - date.getTime()).getUTCFullYear() - 1970);
    return idade + ' ' + (idade == 1 ? 'ano' : 'anos');
  };
});

app.run(['$rootScope', 'dao', 'utils', function($rootScope, dao, utils) {
  $rootScope.utils = utils;

  var db = {};
  db.config = new Datastore({ filename: 'db/config.db', autoload: true});

  var promise = dao.findOne(db.config);
  promise.then(function(doc) {
    if (!doc) {
      CONFIG = {};
      console.log('CONFIG não localizado.');
    } else {
      CONFIG = doc;
      console.log('CONFIG carregado com sucesso.');
      console.log(CONFIG);
    }
  }, function(err) {
    console.log('Erro ao carregar CONFIG.');
    console.log(err);
  });
}]);
