/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const log = require('../utils/log');

const srcFolder = 'src';
const distFolder = process.env.NODE_ENV === 'production' ? 'dist' : 'app';
const excludePattern = /(test|base|styleguide)/;
const importMap = {};

function shorten(str) {
  let result = str.replace(/\.\.\//g, '');
  result = result.replace(/\//g, path.sep);
  return result;
}

function dashCaseToCamelCase(str) {
  return str.replace(/(-\w)/g, m => m[1].toUpperCase());
}

async function build(module) {
  const file = path.parse(module);
  const targetDir = file.dir.replace(srcFolder, distFolder);
  const moduleName = dashCaseToCamelCase(file.name);

  const bundle = await rollup.rollup({
    input: module,
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      resolve({ jsnext: true, main: true }),
      commonjs(),
      process.env.NODE_ENV === 'production' && uglify({}, minify),
    ],
  }).catch(error => log.error('javascript', error));

  const outputOptions = {
    name: moduleName,
    format: 'iife',
    file: path.join(targetDir, `${file.name}.js`),
    sourcemap: process.env.NODE_ENV !== 'production',
    intro: `document.addEventListener('DOMContentLoaded',function(){${moduleName}()});`,
  };

  if (bundle) {
    await bundle.write(outputOptions);

    if (process.env.NODE_ENV !== 'production') {
      const { map } = await bundle.generate(outputOptions);

      const obj = JSON.parse(map.toString());
      obj.sources = obj.sources.reverse();
      const sourceFile = shorten(obj.sources[0]);
      const sourceImports = obj.sources.slice(1);
      if (sourceImports.length) {
        importMap[sourceFile] = sourceImports.map(str => shorten(str));
      }
    }
  }
}

async function rebuild(event, module) {
  if (event === 'remove') {
    log.fileChange('javascript', 'remove', module);
    delete importMap[module];

    const targetPath = module.replace(srcFolder, distFolder);
    if (fs.existsSync(targetPath)) {
      log.fileChange('javascript', 'remove', targetPath);
      fs.unlinkSync(targetPath);
    }
  } else if (!excludePattern.test(module) || /(base.js$|styleguide.js$)/.test(module)) {
    log.fileChange('javascript', 'build', module);
    build(module);
  }

  const files = Object.keys(importMap);
  files.forEach((file) => {
    const sources = importMap[file];
    if (sources.includes(module)) {
      log.fileChange('javascript', 'update', file);
      build(file);
    }
  });
}

async function run() {
  await new Promise((jsResolve) => {
    glob(`${srcFolder}/**/*.js`, async (error, files) => {
      if (error) {
        log.error('javascript', error);
      } else {
        const modules = files.filter(file => !excludePattern.test(file));

        // add only base.js
        const base = path.join(srcFolder, 'base', 'base.js');
        modules.push(base);

        if (process.env.NODE_ENV !== 'production') {
          // add styleguide.js too
          const styleguide = path.join(srcFolder, 'styleguide', 'styleguide.js');
          modules.push(styleguide);
        }

        await Promise.all(modules.map(async (module) => {
          await build(module);
        }));

        jsResolve();
      }
    });
  });
}

if (require.main === module) run();

exports.rebuild = rebuild;
exports.run = run;
