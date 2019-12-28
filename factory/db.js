app.factory('db', function () {
    return {
      alunos: new Datastore({ filename: buildDocPath('alunos'), autoload: true}),
      config: new Datastore({ filename:  buildDocPath('config'), autoload: true}),
      cursos: new Datastore({ filename:  buildDocPath('cursos'), autoload: true}),
      pagamentos: new Datastore({ filename:  buildDocPath('pagamentos'), autoload: true}),
      professores: new Datastore({ filename:  buildDocPath('professores'), autoload: true}),
      usuarios: usuarios = new Datastore({ filename:  buildDocPath('usuarios'), autoload: true}),
    };
  });
  
function buildDocPath(document) {
    return path.join(__dirname, '..', 'db', document)
}
