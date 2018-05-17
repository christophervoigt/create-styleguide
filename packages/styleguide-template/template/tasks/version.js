/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const path = require('path');
const fs = require('fs');
const appRootPath = require('app-root-path');
const semver = require('semver');

async function build(type) {
  const files = [
    'composer.json',
    'bower.json',
    'lerna.json',
  ];

  await Promise.all(files.map(async (file) => {
    const filepath = path.join(appRootPath.toString(), file);

    if (fs.existsSync(filepath)) {
      const json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      const newVersion = semver.inc(json.version, type);
      json.version = newVersion;

      await fs.writeFileSync(filepath, JSON.stringify(json, null, 2));
    }
  }));
}

(async () => {
  switch (process.argv[2]) {
    case 'major':
      await build('major');
      break;

    case 'minor':
      await build('minor');
      break;

    case 'patch':
    default:
      await build('patch');
      break;
  }
})();
