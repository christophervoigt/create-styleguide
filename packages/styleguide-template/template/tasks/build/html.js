/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const shell = require('shelljs');
const pug = require('pug');
const dependency = require('pug-dependency');
const appRootPath = require('app-root-path');
const log = require('../utils/log');

const srcFolder = 'src';
const distFolder = 'app';
const excludePattern = /(base|styleguide|mixin)/;
const importMap = {};

function shorten(str) {
  let result = str.replace(appRootPath.toString(), '');
  result = result.substring(1);
  return result;
}

function build(module) {
  const file = path.parse(module);
  const targetDir = file.dir.replace(srcFolder, distFolder);
  const dependence = dependency(`${srcFolder}/**/*.pug`);

  try {
    const fn = pug.compileFile(module, { self: true });
    const html = fn({
      require,
      usedModules: dependence.find_dependencies(module)
        .filter(filename => filename.includes('modules'))
        .map(str => shorten(str)),
    });

    if (!fs.existsSync(targetDir)) {
      shell.mkdir('-p', targetDir);
    }
    fs.writeFileSync(path.join(targetDir, `${file.name}.html`), html);

    if (process.env.NODE_ENV !== 'production') {
      const sourceImports = dependence.find_dependencies(module);
      if (sourceImports.length) {
        importMap[module] = sourceImports.map(str => shorten(str));
      }
    }
  } catch (error) {
    log.error('html', error);
  }
}

function rebuild(event, module) {
  if (event === 'remove') {
    log.fileChange('html', 'remove', module);
    delete importMap[module];

    const targetPath = module.replace(srcFolder, distFolder).replace('.pug', '.html');
    if (fs.existsSync(targetPath)) {
      log.fileChange('html', 'remove', targetPath);
      fs.unlinkSync(targetPath);
    }
  } else if (!excludePattern.test(module)) {
    log.fileChange('html', 'build', module);
    build(module);
  }

  const files = Object.keys(importMap);
  files.forEach((file) => {
    const sources = importMap[file];
    if (sources.includes(module)) {
      log.fileChange('html', 'update', file);
      build(file);
    }
  });
}

async function run() {
  await new Promise((htmlResolve) => {
    glob(`${srcFolder}/**/*.pug`, async (error, files) => {
      if (error) {
        log.error('html', error);
      } else {
        const modules = files.filter(file => !excludePattern.test(file));
        await Promise.all(modules.map(module => build(module)));

        htmlResolve();
      }
    });
  });
}

if (require.main === module) run();

exports.rebuild = rebuild;
exports.run = run;
