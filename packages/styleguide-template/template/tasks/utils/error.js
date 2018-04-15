/* eslint no-console: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const chalk = require('chalk');
const notifier = require('node-notifier');

module.exports = function showError(error = {}, title = '') {
  const message = error.formatted || error.message || 'no error message';

  console.log(chalk.hex('#F00')(message));
  notifier.notify({
    title,
    message,
  });
};
