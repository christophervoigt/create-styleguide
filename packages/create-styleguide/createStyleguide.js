

'use strict';

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const envinfo = require('envinfo');
const spawn = require('cross-spawn');
const semver = require('semver');
const packageJson = require('./package.json');


let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .allowUnknownOption()
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
    console.log();
    console.log(`    If you encounter any problems, do not hesitate to file an issue:`);
    console.log(`      ${chalk.cyan('https://github.com/chlorophyllkid/create-styleguide/issues/new')}`);
    console.log();
  })
  .parse(process.argv);


if (typeof projectName === 'undefined') {
  if (program.info) {
    envinfo.print({
      packages: ['styleguide-template'],
      noNativeIDE: true,
      duplicates: true,
    });
    process.exit(0);
  }
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-styleguide')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

createApp(projectName);

function createApp (name) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  fs.ensureDirSync(name);
  checkConflicts(root, name);

  console.log(`Creating a new Styleguide in ${chalk.green(root)}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: '0.0.1',
    private: true,
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  const originalDirectory = process.cwd();
  process.chdir(root);

  run(root, appName, originalDirectory);
}

function run(root, appName, originalDirectory) {
  const allDependencies = ['styleguide-template'];

  console.log('Installing packages. This might take a couple of minutes.');

  Promise.resolve('styleguide-template')
    .then(packageName => {
      console.log(`Installing ${chalk.cyan('styleguide-template')}...`);
      console.log();

      return install(root, allDependencies).then(() => packageName);
    })
    .then(packageName => {
      checkNodeVersion(packageName);
      checkInstall(packageName);

      const initPath = path.resolve(process.cwd(), 'node_modules', packageName, 'init.js');
      const init = require(initPath);

      init(root, appName, originalDirectory);
    });
}

function install(root, dependencies) {
  return new Promise((resolve, reject) => {
    const command = 'npm';
    const args = [
      'install',
      '--save',
      '--save-exact',
      '--loglevel',
      'error',
    ].concat(dependencies);

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

function checkConflicts(root, name) {
  const validFiles = [
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    '.npmignore',
    'docs',
    '.travis.yml',
    '.gitattributes',
  ];
  const errorLogFilePatterns = [
    'npm-debug.log',
    'yarn-error.log',
    'yarn-debug.log',
  ];

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    .filter(file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0));

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log('Either try using a new directory name, or remove the files listed above.');
    process.exit(1);
  }

  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    errorLogFilePatterns.forEach(errorLogFilePattern => {
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
}

function checkNodeVersion(packageName) {
  const packageJsonPath = path.resolve(process.cwd(), 'node_modules', packageName, 'package.json');
  const packageJson = require(packageJsonPath);

  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are running Node %s.\n' +
          'Create Styleguide requires Node %s or higher. \n' +
          'Please update your version of Node.'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkInstall(packageName) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath);

  if (typeof packageJson.dependencies === 'undefined') {
    console.error(chalk.red('Missing dependencies in package.json'));
    process.exit(1);
  }

  const packageVersion = packageJson.dependencies[packageName];
  if (typeof packageVersion === 'undefined') {
    console.error(chalk.red(`Unable to find ${packageName} in package.json`));
    process.exit(1);
  }
}