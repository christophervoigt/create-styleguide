/* eslint no-console: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const chalk = require('chalk');
const showError = require('./utils/error');
const Cattleman = require('cattleman');
const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { minify } = require('uglify-es');

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
  const file = path.parse(module);
  const moduleDirs = file.dir.split(path.sep);
  const targetDirs = moduleDirs.splice(srcPathDirs.length, moduleDirs.length);
  const targetPath = path.normalize(targetDirs.join(path.sep));

  const bundle = await rollup.rollup({
    input: module,
    plugins: [
      resolve({
        jsnext: true,
        main: true,
      }),
      commonjs({
        namedExports: {
          'node_modules/jquery/dist/jquery.min.js': ['jquery'],
        },
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      process.env.NODE_ENV === 'production' && uglify({}, minify),
    ],
  }).catch((error) => {
    showError(error, 'JS: build failed');
  });

  const outputOptions = {
    name: file.name,
    format: 'iife',
    file: path.join(distPath, targetPath, `${file.name}.js`),
    sourcemap: process.env.NODE_ENV !== 'production',
    intro: `window.addEventListener('load',function(){new ${file.name}()});`,
  };

  if (bundle) {
    await bundle.write(outputOptions);
  }

  if (bundle && process.env.NODE_ENV !== 'production') {
    const { map } = await bundle.generate(outputOptions);

    const obj = JSON.parse(map.toString());
    obj.sources = obj.sources.reverse();
    const sourceFile = shorten(obj.sources[0]);
    const sourceImports = obj.sources.slice(1);
    if (sourceImports.length && !importMap[sourceFile]) {
      importMap[sourceFile] = sourceImports.map(str => shorten(str));
    }
  }
}

async function rebuild(module) {
  if (builtModules.includes(module)) {
    console.log('JS: build', chalk.green(module));
    build(module);
  }

  const files = Object.keys(importMap);
  files.forEach((file) => {
    const sources = importMap[file];

    if (sources.includes(module)) {
      console.log('JS: rebuild', chalk.green(file));
      build(file);
    }
  });
}

(async () => {
  const cattleman = new Cattleman({
    directory: srcPath,
    excludes: ['base', 'styleguide'],
  });
  const modules = cattleman.gatherFiles('.js');

  const base = path.join('src', 'base', 'base.js');
  modules.push(base);

  if (process.env.NODE_ENV !== 'production') {
    const styleguide = path.join('src', 'styleguide', 'styleguide.js');
    modules.push(styleguide);
  }

  builtModules = modules;

  await Promise.all(modules.map(async (module) => {
    await build(module);
  }));
})();

exports.rebuild = rebuild;
