app.config(function ($routeProvider) {
  $routeProvider.
    when('/login', {
      templateUrl: 'view/login.html'
    }).
    when('/agenda', {
      templateUrl: 'view/agenda.html'
    }).
    when('/alunos', {
      templateUrl: 'view/alunos.html'
    }).
    when('/professores', {
      templateUrl: 'view/professores.html',
    }).
    when('/cursos', {
      templateUrl: 'view/cursos.html'
    }).
    when('/matriculas', {
      templateUrl: 'view/matriculas.html'
    }).
    when('/pagamentos', {
      templateUrl: 'view/pagamentos.html'
    }).
    when('/relatorios', {
      templateUrl: 'view/relatorios.html',
    }).
    when('/config', {
      templateUrl: 'view/config.html',
    }).
    when('/credits', {
      templateUrl: 'view/credits.html',
    }).
    when('/usuarios', {
      templateUrl: 'view/usuarios.html',
    }).
    otherwise({
      redirectTo: '/login'
    });
});
