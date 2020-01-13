# Eliza

**School management software.** 

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

`electron-packager . electron-tutorial-app --overwrite --asar=true --platform=linux --arch=x64 --icon=icons/icon.png --prune=true --out=release`


### Windows

`electron-packager . electron-tutorial-app --overwrite --asar=true --platform=win32 --arch=ia32 --icon=icons/icon.ico --prune=true --out=release --version-string.CompanyName=Eliza --version-string.FileDescription=Eliza --version-string.ProductName="Eliza"`

## License

This software was based on the [electron-quick-start](https://github.com/electron/electron-quick-start) project, available within the Electron documentation.

#### License [CC0 1.0 (Public Domain)](LICENSE.md)
