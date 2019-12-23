app.service('alert', function ($rootScope, $timeout, utils) {
  this.alertMessage = function (message, type) {
    var promise = $timeout(function () {
      if ($rootScope.alert) {
        $rootScope.alert.dismiss();
      }
    }, 3000);
    return {
      message: utils.trustAsHtml(message),
      type: type,
      visible: true,
      promise: promise,
      dismiss: function () {
        $timeout.cancel($rootScope.alert.promise);
        $rootScope.alert = {};
      }
    };
  };
  this.success = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Sucesso!</strong> " + message, "alert-success");
  };
  this.info = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Aviso!</strong> " + message, "alert-info");
  };
  this.warning = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Atenção!</strong> " + message, "alert-warning");
  };
  this.error = function (message) {
    $rootScope.alert = this.alertMessage("<strong>Erro!</strong> " + message, "alert-danger");
  };
});
