/* eslint no-console: ["off", { allow: ["warn"] }] */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const chalk = require('chalk');
const notifier = require('node-notifier');


function format(time = 0) {
  let timeString = '';

  if (time < 1000) {
    const milliseconds = parseInt(time, 0);

    timeString = `${milliseconds}ms`;
  }

  if (time >= 1000 && time < 60000) {
    const seconds = Math.floor(time / 1000);

    timeString = `${seconds}s`;
  }

  if (time >= 60000) {
    const minutes = Math.floor(time / 60000);
    const rest = time - (minutes * 60000);
    const seconds = Math.floor(rest / 1000);

    timeString = `${minutes}m ${seconds}s`;
  }

  return timeString;
}


function start(task = 'task') {
  console.log(
    `[${chalk.gray(new Date().toLocaleTimeString('de-DE'))}]`,
    `Starting ${chalk.magenta(task)} ...`,
  );
}
module.exports.start = start;


function finish(task = 'task', time = 0) {
  console.log(
    `[${chalk.gray(new Date().toLocaleTimeString('de-DE'))}]`,
    `Finished ${chalk.magenta(task)} after ${chalk.blue(format(time))}`,
  );
}
module.exports.finish = finish;


function error(task = 'task', err = {}) {
  const message = err.formatted || err.message || err;

  console.log(
    `[${chalk.gray(new Date().toLocaleTimeString('de-DE'))}]`,
    `Catched ${chalk.magenta(task)} error:`,
  );
  console.log(chalk.red(message));

  notifier.notify({
    title: `Catched ${task} error:`,
    message,
  });
}
module.exports.error = error;


function fileChange(task = 'task', change = 'update', file = '.') {
  console.log(
    `[${chalk.gray(new Date().toLocaleTimeString('de-DE'))}]`,
    `${chalk.magenta(task)} ${change}`,
    chalk.blue(file),
  );
}
module.exports.fileChange = fileChange;
