app.config(function ($routeProvider) {
  $routeProvider.
    when(route.login, {
      templateUrl: 'view/login.html'
    }).
    when(route.agenda, {
      templateUrl: 'view/agenda.html'
    }).
    when(route.alunos, {
      templateUrl: 'view/alunos.html'
    }).
    when(route.professores, {
      templateUrl: 'view/professores.html'
    }).
    when(route.cursos, {
      templateUrl: 'view/cursos.html'
    }).
    when(route.matriculas, {
      templateUrl: 'view/matriculas.html'
    }).
    when(route.pagamentos, {
      templateUrl: 'view/pagamentos.html'
    }).
    when(route.relatorios, {
      templateUrl: 'view/relatorios.html'
    }).
    when(route.config, {
      templateUrl: 'view/config.html'
    }).
    when(route.credits, {
      templateUrl: 'view/credits.html'
    }).
    when(route.usuarios, {
      templateUrl: 'view/usuarios.html'
    }).
    when(route.splash, {
      templateUrl: 'view/splash.html'
    }).
    otherwise({
      redirectTo: route.splash,
    });
});
