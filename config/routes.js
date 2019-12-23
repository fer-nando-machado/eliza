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
