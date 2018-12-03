

'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');


module.exports = function(appPath, appName, originalDirectory) {
  const ownPackageName = require(path.join(__dirname, 'package.json')).name;
  const ownPath = path.join(appPath, 'node_modules', ownPackageName);
  const appPackage = require(path.join(appPath, 'package.json'));


  appPackage.dependencies = appPackage.dependencies || {};

  appPackage.scripts = {
    prestart: 'rimraf app/',
    start: 'node tasks/watch.js',
    prebuild: 'rimraf app/',
    build: 'npm run build:font && npm run build:css && npm run build:html && npm run build:img && npm run build:js && npm run build:static',
    'build:font': 'node tasks/build/font.js',
    'build:css': 'node tasks/build/css.js',
    'build:html': 'node tasks/build/html.js',
    'build:img': 'node tasks/build/image.js',
    'build:js': 'node tasks/build/javascript.js',
    'build:static': 'node tasks/build/static.js',
    test: 'npm run lint',
    lint: 'npm run lint:css && npm run lint:js && npm run lint:markdown',
    'lint:css': 'stylelint -q ./src/**/*.scss',
    'lint:js': 'eslint --quiet ./src/**/*.js ./tasks/**/*.js',
    'lint:markdown': 'remark -q . ./src/**/*.md',
    preversion: 'npm test && rimraf dist/',
    version: 'cross-env NODE_ENV=production npm run build && git add -A dist',
    'version:patch': 'node tasks/version.js patch && git add -u',
    'version:minor': 'node tasks/version.js minor && git add -u',
    'version:major': 'node tasks/version.js major && git add -u',
    'dist-patch': "npm run version:patch | npm version patch -m \"Upgrade assets to %s\"",
    'dist-minor': "npm run version:minor | npm version minor -m \"Upgrade assets to %s\"",
    'dist-major': "npm run version:major | npm version major -m \"Upgrade assets to %s\""
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );


  const templatePath = path.join(ownPath, 'template');

  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error(`Could not locate supplied template: ${chalk.green(templatePath)}`);
    return;
  }

  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  } catch (err) {
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  const command = 'npm';
  const args = [
    'install',
    '--verbose',
    '--loglevel',
    'error',
  ];

  const dependenciesPath = path.join(appPath, 'dependencies.json');

  if (fs.existsSync(dependenciesPath)) {
    const dependencies = require(dependenciesPath).dependencies;
    const devDependencies = require(dependenciesPath).devDependencies;

    if (typeof dependencies !== 'undefined') {
      let saveArgs = args;
      saveArgs.push('--save');
      saveArgs = saveArgs.concat(
        Object.keys(dependencies).map(key => {
          return `${key}@${dependencies[key]}`;
        })
      );

      console.log();
      console.log(`Installing ${chalk.cyan('styleguide-template')}'s dependencies...`);
      const proc = spawn.sync(command, saveArgs, { stdio: 'inherit' });
      if (proc.status !== 0) {
        console.error(`\`${command} ${saveArgs.join(' ')}\` failed`);
        return;
      }
    }

    if (typeof devDependencies !== 'undefined') {
      let saveDevArgs = args;
      saveDevArgs.push('--save-dev');

      saveDevArgs = saveDevArgs.concat(
        Object.keys(devDependencies).map(key => {
          return `${key}@${devDependencies[key]}`;
        })
      );

      console.log();
      console.log(`Installing ${chalk.cyan('styleguide-template')}'s devDependencies...`);
      const proc = spawn.sync(command, saveDevArgs, { stdio: 'inherit' });
      if (proc.status !== 0) {
        console.error(`\`${command} ${saveDevArgs.join(' ')}\` failed`);
        return;
      }
    }

    fs.unlinkSync(dependenciesPath);
  }


  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan('  npm start'));
  console.log('    Runs build and watch task for local development.');
  console.log();
  console.log(chalk.cyan('  npm run build'));
  console.log('    Builds the app directory.');
  console.log();
  console.log(chalk.cyan('  npm test'));
  console.log('    Starts the test runner.');
  console.log();
  console.log('I suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(chalk.cyan('  npm start'));
  console.log();
  console.log('Enjoy templating!');
  console.log();
}
