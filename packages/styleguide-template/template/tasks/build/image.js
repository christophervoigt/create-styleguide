/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const log = require('../utils/log');

const srcFolder = 'src';
const distFolder = process.env.NODE_ENV === 'production' ? 'dist' : 'app';
const excludePattern = process.env.NODE_ENV === 'production' ? /(font|styleguide)/ : /(font)/;

async function build(module) {
  const file = path.parse(module);
  const targetDir = file.dir.replace(srcFolder, distFolder);

  if (file.ext === '.svg') {
    await imagemin([module], targetDir, { use: [imageminSvgo()] });
  } else {
    await imagemin([module], targetDir);
  }
}

function rebuild(event, module) {
  if (event === 'remove') {
    log.fileChange('image', 'remove', module);

    const targetPath = module.replace(srcFolder, distFolder);
    if (fs.existsSync(targetPath)) {
      log.fileChange('image', 'remove', targetPath);
      fs.unlinkSync(targetPath);
    }
  } else if (!excludePattern.test(module)) {
    log.fileChange('image', 'build', module);
    build(module);
  }
}

async function run() {
  await new Promise((imgResolve) => {
    glob(`${srcFolder}/**/*{.jpg,.png,.gif,.svg,.ico}`, async (error, files) => {
      if (error) {
        log.error('image', error);
      } else {
        const modules = files.filter(file => !excludePattern.test(file));

        await Promise.all(modules.map(async (module) => {
          await build(module);
        }));

        imgResolve();
      }
    });
  });
}

if (require.main === module) run();

exports.rebuild = rebuild;
exports.run = run;
