/* eslint global-require: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint import/no-dynamic-require: ["off", { allow: ["warn"] }] */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const tape = require('tape');
const browserSync = require('browser-sync').create();
const appRootPath = require('app-root-path');
const log = require('./utils/logger');

const srcFolder = 'src';
const distFolder = 'app';

(async () => {
  const testFunctions = [];

  const appPath = path.join(appRootPath.toString(), distFolder);
  if (!fs.existsSync(appPath)) {
    log.error('test', { message: 'Make sure ./app exists. Run `npm run build` if necessary.' });
    tape.onFinish(() => process.exit(0));
  }

  browserSync.init({
    server: { baseDir: distFolder },
    open: false,
    logLevel: 'silent',
  });

  await new Promise((testResolve) => {
    glob(`${srcFolder}/**/*.test.js`, async (error, files) => {
      if (error) {
        log.error('test', error);
      } else {
        const modules = files;
        await Promise.all(modules.map(async (module) => {
          const absolutePath = path.join(__dirname, '..', path.sep, module);
          const { test } = require(absolutePath);

          testFunctions.push(await test());
        }));

        testResolve();
      }
    });
  });

  tape('tests', (assert) => {
    testFunctions.forEach((testFunction) => {
      testFunction();
    });

    assert.end();
  });

  browserSync.exit();
})();
