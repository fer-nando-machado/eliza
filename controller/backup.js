app.controller('backup', function($scope, dao, pager, alert, utils, navigator) {
    var vm = this;

    const remote = require("electron").remote;
    const downloadManager = remote.require("electron-download-manager");
  
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
      vm.backup = undefined;
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
        $scope.$broadcast('finished');
      });
    };
  
    vm.findBackups = function() {
      vm.failedToInitialize = true;
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
        vm.failedToInitialize = false;
        vm.setPage(1);
        $scope.$apply();
      }).catch(err => {
        alert.error('Ocorreu um erro ao tentar buscar os backups.');
        console.log(err);
      });
    };

    vm.findBackupById = function(id) {
      const root = firebase.storage().ref();
      root.child(id).listAll().then((result) => {
        let backup = {
          _id: id,
          date: new Date(new Number(id)),
          files: [],
          size: 0,
        }

        let promises = [];
        result.items.forEach(item => {
          promises.push(item.getMetadata());
        });

        Promise.all(promises).then((files) => {
          files.forEach(file => {
            backup.files.push({
              name: file.name,
              size: file.size,
              ref: file.ref,
            });
            backup.size += file.size;
          });
          vm.backup = backup;
        }).catch(err => { 
          alert.error('Ocorreu um erro ao tentar criar o backup.');
          console.error(err);
        }).finally(() => {
          $scope.$apply();
        });
      }).catch(err => {
        alert.error('Ocorreu um erro ao tentar buscar os backups.');
        console.log(err);
      });
    };

    vm.downloadBackup = function(backup) {
      if (!confirm('Ao restaurar este backup, a aplicação será reiniciada e todos os dados ' + 
                  'criados após ' + utils.formatDate(backup.date, "dd/MM/yyyy HH:mm:ss") + 
                  ' serão perdidos.\nTem certeza que deseja continuar?')) {
        return;
      }

      Object.entries(dao.db).forEach(([title, datastore]) => {
          fs.renameSync(datastore.filename, datastore.filename + '.old');
      });

      let promises = [];
      backup.files.forEach(file => {
        promises.push(file.ref.getDownloadURL());
      });

      Promise.all(promises).then((files) => {
        downloadManager.bulkDownload({
          urls: files,
          path: "db",
        }, function (error, finished, errors) {
          Object.entries(dao.db).forEach(([title, datastore]) => {
            fs.unlinkSync(datastore.filename + '.old');
          });
          remote.app.relaunch();
          remote.app.exit(0);
        });
      }).catch(err => { 
        Object.entries(dao.db).forEach(([title, datastore]) => {
          fs.renameSync(datastore.filename + '.old', datastore.filename);
        });
        alert.error('Ocorreu um erro ao tentar restaurar o backup.');
        console.error(err);
      });
    };

    vm.removeBackup = function(backup) {
      if (!confirm('Tem certeza que deseja remover este backup?')) {
        return;
      }

      let promises = [];
      backup.files.forEach(file => {
        promises.push(file.ref.delete());
      });

      Promise.all(promises).then((files) => {
        alert.success("Backup removido com sucesso!");
        vm.backup = undefined;
        vm.findBackups();
      }).catch(err => { 
        alert.error('Ocorreu um erro ao tentar restaurar o backup.');
        console.error(err);
      });

    };

  });