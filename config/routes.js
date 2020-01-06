app.config(function ($routeProvider) {
  $routeProvider.
    when(route.login, {
      templateUrl: 'view/login.html',
      reloadOnUrl: false,
    }).
    when(route.agenda, {
      templateUrl: 'view/agenda.html',
      reloadOnUrl: false,
    }).
    when(route.alunos, {
      templateUrl: 'view/alunos.html',
      reloadOnUrl: false,
    }).
    when(route.professores, {
      templateUrl: 'view/professores.html',
      reloadOnUrl: false,
    }).
    when(route.cursos, {
      templateUrl: 'view/cursos.html',
      reloadOnUrl: false,
    }).
    when(route.matriculas, {
      templateUrl: 'view/matriculas.html',
      reloadOnUrl: false,
    }).
    when(route.pagamentos, {
      templateUrl: 'view/pagamentos.html',
      reloadOnUrl: false,
    }).
    when(route.relatorios, {
      templateUrl: 'view/relatorios.html',
      reloadOnUrl: false,
    }).
    when(route.config, {
      templateUrl: 'view/config.html',
      reloadOnUrl: false,
    }).
    when(route.credits, {
      templateUrl: 'view/credits.html',
      reloadOnUrl: false,
    }).
    when(route.usuarios, {
      templateUrl: 'view/usuarios.html',
      reloadOnUrl: false,
    }).
    when(route.splash, {
      templateUrl: 'view/splash.html',
      reloadOnUrl: false,
    }).
    when(route.backup, {
      templateUrl: 'view/backup.html',
      reloadOnUrl: false,
    }).
    otherwise({
      redirectTo: route.splash,
    });
});
