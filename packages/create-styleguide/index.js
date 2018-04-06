#!/usr/bin/env node


const chalk = require('chalk');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 4) {
  console.error(chalk.red(`You are running Node ${currentNodeVersion}.`, 'create-styleguide requires Node 4 or higher.', 'Please update your version of Node.'));
  process.exit(1);
}

require('./createStyleguide');
