app.run(['$rootScope', '$location', 'dao', 'utils', function($rootScope, $location, dao, utils) {
  $rootScope.utils = utils;

  loadConfig(dao, utils);
  createRootUser(dao);
}]);

async function loadConfig(dao, utils) {
  try {
    const config = await dao.findOne(dao.db.config);
    utils.setCurrentConfig(config || {});
  } catch (err) {
    console.log(err);
  }
}

async function createRootUser(dao) {
  try {
    const users = await dao.count(dao.db.usuarios, {});
    if (users == 0) {
      const newUser = {
        nome: 'root',
        login: 'root',
        password: 'cm9vdA==',
        level: '0'
      }
      dao.insert(dao.db.usuarios, newUser);
    }
  } catch(err) {
    console.log(err);
  }
};
