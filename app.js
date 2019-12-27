app.run(['$rootScope', 'db', 'dao', 'utils', function($rootScope, db, dao, utils) {
  $rootScope.utils = utils;

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
