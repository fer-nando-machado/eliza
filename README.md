# Eliza

## School Management Software

![Eliza: Agenda](/docs/eliza1.png "Eliza: Agenda")

Software para gerenciamento de escolas, incluindo agenda; cadastro de alunos, professores e cursos; efetuação de matrículas; recebimento de pagamentos e relatórios.

![Eliza: Alunos](/docs/eliza2.png "Eliza: Alunos")
![Eliza: Cursos](/docs/eliza3.png "Eliza: Cursos")
![Eliza: Pagamentos](/docs/eliza4.png "Eliza: Pagamentos")
![Eliza: Relatórios](/docs/eliza5.png "Eliza: Relatórios")

Dados são persistidos apenas localmente. Opcionalmente, você pode configurar backups na nuvem (Firebase).

![Eliza: Firebase](/docs/eliza6.png "Eliza: Firebase")

Ao executar a aplicação pela primeira vez, você poderá criar os dados de login com permissões de admin e, em seguida, definir os demais usuários.

![Eliza: Login](/docs/eliza7.png "Eliza: Login")

## Electron

This is a cross-platform desktop app, created using the following technologies:

- [Electron](https://electronjs.org/)
- [Node.js](https://nodejs.org/en/)
- [NeDB](https://github.com/louischatriot/nedb)
- [Angular v1.x](https://angularjs.org/)

## How to run

`npm start`

## How to build

Before anything else, make sure you have `electron-packager` installed. If not, run the command:

`npm install electron-packager -g`

Now, run the following commands for each system and find the generated binaries on the `release` folder.

### OS X

`electron-packager . --overwrite --platform=darwin --arch=x64 --icon=icons/icon.icns --prune=true --out=release`

### Linux

`electron-packager . --overwrite --platform=linux --arch=x64 --icon=icons/icon.png --prune=true --out=release`

### Windows

`electron-packager . --overwrite --platform=win32 --arch=ia32 --icon=icons/icon.ico --prune=true --out=release --version-string.CompanyName=Eliza --version-string.FileDescription=Eliza --version-string.ProductName="Eliza"`

## License

MIT 2016
