
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');
const log = require('./log');

async function spawnTask(task) {
  const startTime = performance.now();
  log.start(task);

  const child = spawn('node', [`tasks/build/${task}.js`]);

  child.stderr.on('data', (data) => {
    const error = Buffer.from(data);
    log.error(task, error.toString());
  });

  await new Promise((resolve) => {
    child.on('close', () => {
      const time = performance.now() - startTime;
      log.finish(task, time);
      resolve();
    });
  });
}

async function handle(argument) {
  await new Promise(async (resolve) => {
    if (typeof argument === 'string') {
      await spawnTask(argument);
    } else if (typeof argument === 'function') {
      await argument();
    } else if (argument instanceof Array) {
      await Promise.all(argument.map(async (task) => {
        await handle(task); // recursion
      }));
    }

    resolve();
  });
}

function execute(...tasks) {
  return async () => {
    await tasks.reduce(async (promise, next) => {
      await promise;
      return handle(next);
    }, Promise.resolve());
  };
}

// can be called like this:

// (execute(
//   ['static', 'image', 'javascript', execute(['color', 'icon'], 'css')],
//   'html',
// ))();

// (execute(
//   ['static', 'image'],
//   'javascript',
//   execute(['color', 'icon'], 'css'),
//   'html',
// ))();

exports.execute = execute;
