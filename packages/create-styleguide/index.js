#!/usr/bin/env node

'use strict';

var chalk = require('chalk');

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split('.');
var major = semver[0];

if (major < 4) {
  console.error(
    chalk.red(
      `You are running Node ${currentNodeVersion}.`,
      'create-styleguide requires Node 4 or higher.',
      'Please update your version of Node.'
    )
  );
  process.exit(1);
}

require('./createStyleguide');
