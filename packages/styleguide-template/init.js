

'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');

console.log(chalk.green('// ToDo: copy template to project folder :D'));
