app.run(['$rootScope', 'navigator', 'dao', 'utils', 'users', 'alert', 
  function($rootScope, navigator, dao, utils, users, alert) {
  $rootScope.utils = utils;
  $rootScope.users = users;

  redirectToSetupOrLogin();

  async function redirectToSetupOrLogin() {
    try {
      const config = await dao.findOne(dao.db.config);
      if (config && config.firebasePassword) {
        config.firebasePassword = utils.decrypt(config.firebasePassword);
      }
      utils.setCurrentConfig(config || {});

      const count = await dao.count(dao.db.usuarios, {});
      if (count == 0) {
        users.useRoot();
        navigator.go(route.usuarios);
        alert.info("Crie um usuário para começar a usar o sistema.");
      } else {
        navigator.go(route.login);
      }
    } catch(err) {
      console.log(err);
    }
  }

}]);