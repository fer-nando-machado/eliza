app.factory('utils', function ($rootScope, $filter, $sce) {
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
      { _id: 0, label: 'Dinheiro' },
      { _id: 1, label: 'Cartão de Crédito' },
      { _id: 2, label: 'Cartão de Débito' },
      { _id: 3, label: 'Cheque' }
    ],
    getCurrentConfig: function () {
      return $rootScope.config;
    },
    setCurrentConfig: function (config) {
      $rootScope.config = config;
    },
    estados: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
    getMeiosLabel: function (id) {
      for (var i = 0; i < meiosOptions.length; i++) {
        if (meiosOptions[i]._id == id) {
          return meiosOptions[i].label;
        }
      }
      return '';
    },
    addElement: function (array, element) {
      array.push(element);
    },
    removeElement: function (array, i) {
      array.splice(i, 1);
    },
    removeDuplicates: function (array) {
      var set = Array.from(new Set(array));
      set = set.filter(function (item) {
        return !!item;
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
    normalize: function (str) {
      if (!str) {
        return '';
      }
      return Normalizer(str).toLowerCase();
    },
    newRegExp: function (str) {
      return new RegExp(this.normalize(str), "i");
    },
    getCursoStatus: function (curso, dia) {
      if (dia < curso.inicio) {
        return 1;
      }
      if (dia > curso.fim) {
        return -1;
      }
      return 0;
    },
    getCursoStatusLabel: function (curso) {
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
    startOfMonth: function (date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    endOfMonth: function (date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },
    addDays: function (date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    getNascimentoMaxLimit: function () {
      var today = this.today();
      return new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    },
    getInicioMaxLimit: function (fim) {
      if (!fim) {
        return new Date(3000, 11, 31);
      }
      return fim;
    },
    getFimMinLimit: function (inicio) {
      if (!inicio) {
        return new Date(new Date().getFullYear(), 0, 1);
      }
      return inicio;
    },
    getRandom: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getReais: function (valor) {
      return $filter('currency')(valor, 'R$');
    },
    getDouble: function (value, size) {
      return $filter('number')(value, size);
    },
    formatDate: function (value, mask) {
      return $filter('date')(value, mask);
    },
    getPlanoLabel: function (plano, displayTotal) {
      if (!plano.parcelas || !plano.valor) {
        return this.getBolsaLabel();
      }
      var planoString = plano.parcelas + "x " + this.getReais(plano.valor);
      if (plano.parcelas == 1 || !displayTotal) {
        return planoString;
      }
      return planoString + " (" + this.getReais(plano.parcelas * plano.valor) + ")";
    },
    getValorPago: function (plano) {
      var valorPago = 0;
      for (var i = 0; i < plano.pagamentos.length; i++) {
        valorPago += plano.pagamentos[i].valor;
      }
      return valorPago;
    },
    getValorEsperado: function (plano) {
      return plano.valor * plano.parcelas;
    },
    getSituacaoPlano: function (plano, displayTotal) {
      plano.label = this.getPlanoLabel(plano, displayTotal);
      plano.valorPago = this.getValorPago(plano);
      plano.valorEsperado = this.getValorEsperado(plano);
      plano.valorRemanescente = plano.valorEsperado - plano.valorPago;
      if (plano.valorRemanescente < 0) {
        plano.valorRemanescente = 0;
      }
      plano.situacao = plano.valorRemanescente > 0 ? "Pendente" : "Quitado";
    },
    getBolsaLabel: function () {
      return "Bolsista";
    },
    getIds: function (array) {
      var ids = [];
      array.forEach(function (element) {
        ids.push(element._id);
      });
      return ids;
    },
    encrypt: function (string) {
      return window.btoa(string);
    },
    decrypt: function (string) {
      return window.atob(string);
    },
    trustAsHtml: function (string) {
      return $sce.trustAsHtml(string);
    }
  };
});
