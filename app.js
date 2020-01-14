app.run(['$rootScope', 'navigator', 'dao', 'utils', 'users', 'alert', 
  function($rootScope, navigator, dao, utils, users, alert) {
  $rootScope.utils = utils;
  $rootScope.users = users;

  loadConfig();
  redirectToSetupOrLogin();

  async function loadConfig() {
    try {
      const config = await dao.findOne(dao.db.config);
      config.firebasePassword = utils.decrypt(config.firebasePassword);
      utils.setCurrentConfig(config || {});
    } catch (err) {
      console.log(err);
    }
  }

  async function redirectToSetupOrLogin() {
    try {
      const count = await dao.count(dao.db.usuarios, {});
      if (count == 0) {
        users.useRoot();
        navigator.go(route.usuarios);
        alert.info("Crie um usuário para começar a usar o Eliza.");
      } else {
        navigator.go(route.login);
      }
    } catch(err) {
      console.log(err);
    }
  }

}]);