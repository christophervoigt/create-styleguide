/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const shell = require('shelljs');
const log = require('../utils/log');

const srcFolder = 'src';
const distFolder = process.env.NODE_ENV === 'production' ? 'dist' : 'app';
const excludePattern = process.env.NODE_ENV === 'production' ? /(menu.json|.font.json|styleguide)/ : /(menu.json|.font.json)/;

async function build(module) {
  const file = path.parse(module);
  const targetDir = file.dir.replace(srcFolder, distFolder);

  await shell.mkdir('-p', targetDir);
  await shell.cp(module, targetDir);
}

function rebuild(event, module) {
  if (event === 'remove') {
    log.fileChange('static', 'remove', module);

    const targetPath = module.replace(srcFolder, distFolder);
    if (fs.existsSync(targetPath)) {
      log.fileChange('static', 'remove', targetPath);
      fs.unlinkSync(targetPath);
    }
  } else if (!excludePattern.test(module)) {
    log.fileChange('static', 'copy', module);
    build(module);
  }
}

async function run() {
  await new Promise((staticResolve) => {
    glob(`${srcFolder}/**/*{.eot,.woff,.woff2,.ttf,.json}`, async (error, files) => {
      if (error) {
        log.error('static', error);
      } else {
        const modules = files.filter(file => !excludePattern.test(file));

        await Promise.all(modules.map(async (module) => {
          await build(module);
        }));

        staticResolve();
      }
    });
  });
}

if (require.main === module) run();

exports.rebuild = rebuild;
exports.run = run;
