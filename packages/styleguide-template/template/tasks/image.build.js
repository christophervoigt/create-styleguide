/* eslint no-console: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const chalk = require('chalk');
const Cattleman = require('cattleman');
const imagemin = require('imagemin');

const srcPath = 'src';
const distPath = process.env.NODE_ENV === 'production' ? 'dist' : 'app';

async function build(module) {
  const srcPathDirs = srcPath.split('/');

  const file = path.parse(module);
  const moduleDirs = file.dir.split(path.sep);
  const targetDirs = moduleDirs.splice(srcPathDirs.length, moduleDirs.length);
  const targetPath = path.normalize(targetDirs.join(path.sep));
  const targetDir = path.join(distPath, targetPath);

  await imagemin([module], targetDir);
}

async function rebuild(module) {
  console.log('IMG: build', chalk.green(module));
  build(module);
}

(async () => {
  let cattleman = new Cattleman(srcPath);

  if (process.env.NODE_ENV === 'production') {
    cattleman = new Cattleman({
      directory: srcPath,
      excludes: ['styleguide'],
    });
  }

  const modules = cattleman.gatherFiles(['.jpg', '.png', '.svg', '.ico']);

  await Promise.all(modules.map(async (module) => {
    await build(module);
  }));
})();

exports.rebuild = rebuild;
