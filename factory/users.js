app.factory('users', function ($rootScope) {
    return {
      labels: [
        '', 'Administração', 'Operação'
      ],
      getCurrent: function () {
        return $rootScope.user;
      },
      setCurrent: function (user) {
        $rootScope.user = user;
      },
      useRoot: function () {
        this.setCurrent({_id: '', level: '0'});
      },
      logout: function () {
        this.setCurrent(undefined);
      },
      isRoot: function () {
        return this.getCurrent() && this.getCurrent().level == "0";
      },
      isAdmin: function () {
        return this.getCurrent() && this.getCurrent().level == "1";
      },
      isUser: function () {
        return this.getCurrent() && this.getCurrent().level == "2";
      },
      isReal: function () {
        return this.getCurrent() && !this.isRoot();
      },
      isThis: function (id) {
        return this.getCurrent() && this.getCurrent()._id == id;
      },
    };
  });
  