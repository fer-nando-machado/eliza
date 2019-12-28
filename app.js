app.run(['$rootScope', 'navigator', 'dao', 'utils', 'alert', function($rootScope, navigator, dao, utils, alert) {
  $rootScope.utils = utils;
  loadConfig(dao, utils);
  redirectToSetupOrLogin(dao, navigator, utils, alert);
}]);

async function loadConfig(dao, utils) {
  try {
    const config = await dao.findOne(dao.db.config);
    utils.setCurrentConfig(config || {});
  } catch (err) {
    console.log(err);
  }
}

async function redirectToSetupOrLogin(dao, navigator, utils, alert) {
  try {
    const users = await dao.count(dao.db.usuarios, {});
    if (users == 0) {
      utils.setCurrentUser({_id: '', level: '0'});
      navigator.go(route.usuarios);
      alert.info("Crie um usuário para começar a usar o Eliza.");
    } else {
      navigator.go(route.login);
    }
  } catch(err) {
    console.log(err);
  }
}

