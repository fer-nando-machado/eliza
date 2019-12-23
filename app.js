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
