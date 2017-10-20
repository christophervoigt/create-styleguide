#!/usr/bin/env node


'use strict';

var chalk = require('chalk');

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split('.');
var major = semver[0];

console.log(
    chalk.greenBright('You are running ' + chalk.yellowBright('Node ' + currentNodeVersion) + '.')
);

if (major < 4) {
  console.error(
    chalk.redBright('Error: create-styleguide requires Node 4 or higher.')
  );
  process.exit(1);
}

// do something
