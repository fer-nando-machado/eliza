app.run(['$rootScope', 'dao', 'utils', function($rootScope, dao, utils) {
  $rootScope.utils = utils;

  var db = {};
  db.config = new Datastore({ filename: 'db/config.db', autoload: true});

  var promise = dao.findOne(db.config);
  promise.then(function(doc) {
    if (!doc) {
      utils.setCurrentConfig({});
      console.log('Config não localizado.');
    } else {
      utils.setCurrentConfig(doc);
      console.log('Config carregado com sucesso.');
      console.log(doc);
    }
  }, function(err) {
    console.log('Erro ao carregar Config.');
    console.log(err);
  });
}]);
