app.factory('db', function () {
    const alunos = new Datastore({ filename: buildDocPath('alunos'), autoload: true});
    const config = new Datastore({ filename:  buildDocPath('config'), autoload: true});
    const cursos = new Datastore({ filename:  buildDocPath('cursos'), autoload: true});
    const pagamentos = new Datastore({ filename:  buildDocPath('pagamentos'), autoload: true});
    const professores = new Datastore({ filename:  buildDocPath('professores'), autoload: true});
    const usuarios = new Datastore({ filename:  buildDocPath('usuarios'), autoload: true});

    return {
      alunos,
      config,
      cursos,
      pagamentos,
      professores,
      usuarios
    };
  });
  
function buildDocPath(document) {
    return path.join(__dirname, '..', 'db', document)
}