/* eslint no-console: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const showError = require('./utils/error');
const Cattleman = require('cattleman');
const shell = require('shelljs');
const sass = require('node-sass');
const importer = require('node-sass-tilde-importer');

const srcPath = 'src';
const distPath = process.env.NODE_ENV === 'production' ? 'dist' : 'app';
const importMap = {};
let builtModules = [];

function shorten(str) {
  let result = str.replace(/\.\.\//g, '');
  result = result.replace(/\//g, path.sep);
  return result;
}

async function build(module) {
  const srcPathDirs = srcPath.split('/');
  const outputStyle = process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded';
  const buildSourceMap = process.env.NODE_ENV !== 'production';

  const file = path.parse(module);
  const moduleDirs = file.dir.split(path.sep);
  const targetDirs = moduleDirs.splice(srcPathDirs.length, moduleDirs.length);
  const targetPath = path.normalize(targetDirs.join(path.sep));
  const targetDir = path.join(distPath, targetPath);

  await sass.render({
    file: module,
    importer,
    outFile: path.join(targetDir, `${file.name}.css`),
    outputStyle,
    sourceMap: buildSourceMap,
    includePaths: ['node_modules'],
  }, (error, result) => {
    if (error) {
      showError(error, 'CSS: build failed');
    } else {
      if (!fs.existsSync(targetDir)) { shell.mkdir('-p', targetDir); }

      fs.writeFileSync(path.join(targetDir, `${file.name}.css`), result.css);

      if (buildSourceMap) {
        fs.writeFileSync(path.join(targetDir, `${file.name}.css.map`), result.map);

        const obj = JSON.parse(result.map.toString());
        const sourceFile = shorten(obj.sources[0]);
        const sourceImports = obj.sources.slice(1);
        if (sourceImports.length && !importMap[sourceFile]) {
          importMap[sourceFile] = sourceImports.map(str => shorten(str));
        }
      }
    }
  });
}

async function rebuild(module) {
  if (builtModules.includes(module)) {
    console.log('CSS: build', chalk.green(module));
    build(module);
  }

  const files = Object.keys(importMap);
  files.forEach((file) => {
    const sources = importMap[file];

    if (sources.includes(module)) {
      console.log('CSS: rebuild', chalk.green(file));
      build(file);
    }
  });
}

(async () => {
  const cattleman = new Cattleman({
    directory: srcPath,
    excludes: ['base', 'styleguide'],
  });
  const modules = cattleman.gatherFiles('.scss');

  const base = path.join('src', 'base', 'base.scss');
  modules.push(base);

  if (process.env.NODE_ENV !== 'production') {
    const styleguide = path.join('src', 'styleguide', 'styleguide.scss');
    modules.push(styleguide);
  }

  builtModules = modules;

  await Promise.all(modules.map(async (module) => {
    await build(module);
  }));
})();

exports.rebuild = rebuild;
