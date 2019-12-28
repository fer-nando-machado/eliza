app.controller('agenda', function(dao, utils) {
    var vm = this;
  
    vm.initAgenda = function() {
      vm.escopo = utils.today();
      this.loadCalendario();
    };
  
    vm.loadCalendario = function() {
      var inicio = utils.startOfMonth(vm.escopo);
      inicio.setDate(inicio.getDate() - inicio.getDay());
      var fim = utils.endOfMonth(vm.escopo);
      fim.setDate(fim.getDate() + 6 - fim.getDay());
  
      var promise = dao.find(dao.db.cursos, {$where: function () {
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
  