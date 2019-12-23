app.filter('age', function() {
    return function(date) {
      if (!date) {
        return '';
      }
      var idade = Math.abs(new Date(Date.now() - date.getTime()).getUTCFullYear() - 1970);
      return idade + ' ' + (idade == 1 ? 'ano' : 'anos');
    };
  });
  