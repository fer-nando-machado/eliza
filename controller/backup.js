app.controller('backup', function($scope, dao, pager, alert, utils, navigator) {
    var vm = this;

    vm.initBackup = function() {  
      const apiKey = utils.getCurrentConfig().apiKey;
      const projectId = utils.getCurrentConfig().projectId;
      if (!apiKey || !projectId) {
        navigator.go(route.splash);
        alert.warning("As configurações do Firebase não foram encontradas.")
        return;
      }
      initializeFirebase(apiKey, projectId);
      vm.findBackups();
    };

    function initializeFirebase(apiKey, projectId) {
      if (firebase.apps.length == 1) {
        return;
      }
      const firebaseConfig = {
        apiKey: apiKey,
        projectId: projectId,
        storageBucket: projectId + ".appspot.com",
      };
      firebase.initializeApp(firebaseConfig);
    }
  
    vm.setPage = function(page) {
      vm.pager = pager.getPager(vm.backups.length, page);
      vm.items = vm.backups;
      if (vm.pager.totalItems == 0) {
        return;
      }
      vm.items = vm.backups.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };

    vm.createBackup = function() {
      const root = firebase.storage().ref();
      const now = new Date().getTime().toString();

      let promises = [];
      Object.entries(dao.db).forEach(([title, datastore]) => {
        let promise = new Promise((resolve, reject) => {
          const target = root.child(now).child(title);
          fs.readFile(datastore.filename, 'utf8', (err, content) => {
            if (err) {
              reject(err);
            } else {
              target.putString(content).then(snapshot => {
                resolve(title);
              });
            }
          });
        });
        promises.push(promise);
      });

      Promise.all(promises).then((files) => {
        alert.success('Backup criado com sucesso!');
        vm.findBackups();
      }).catch(err => { 
        alert.error('Ocorreu um erro ao tentar criar o backup.');
        console.error(err);
      }).finally(() => {
        $scope.$broadcast('finished')
      });
    };
  
    vm.findBackups = function() {
      const root = firebase.storage().ref();
      let backups = [];
      root.listAll().then((result) => {
        result.prefixes.forEach(backup => {
          backups.push({
            _id: backup.name,
            date: new Date(new Number(backup.name))
          });
        })
        backups.sort((a,b) => b.date - a.date);
        vm.backups = backups;
        vm.setPage(1);
        $scope.$apply();
      }).catch(err => {
        navigator.go(route.splash);
        alert.error('Ocorreu um erro ao tentar buscar os backups.');
        console.log(err);
      });
    };

    vm.findBackupById = function(id) {
      const root = firebase.storage().ref();
      root.child(id).listAll().then((result) => {
        // create a build for this?
        let backup = {
          _id: id,
          date: new Date(new Number(id)),
          files: []
        }
        // render files on page
        result.items.forEach(item => {
          backup.files.push(item);
        })
          vm.backup = backup;
          $scope.$apply();
      }).catch(err => {
        alert.error('Ocorreu um erro ao tentar buscar os backups.');
        console.log(err);
      });
    };

    // TODO allow to load backup replacing existing files 
    // TODO user logout, config reset afterwards

  });