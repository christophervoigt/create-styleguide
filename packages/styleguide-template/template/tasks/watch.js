/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const browserSync = require('browser-sync');
const watch = require('node-watch');

// tasks
const rebuildCSS = require('./css.build').rebuild;
const rebuildHTML = require('./html.build').rebuild;
const rebuildIMG = require('./image.build').rebuild;
const rebuildJS = require('./javascript.build').rebuild;
const rebuildSTATIC = require('./static.build').rebuild;

const srcPath = 'src';

browserSync({
  server: {
    baseDir: 'app',
  },
  open: 'local',
});


watch(srcPath, {
  recursive: true,
  filter: /\.scss$/,
}, async (event, name) => {
  await rebuildCSS(name);
  browserSync.reload();
});

watch(srcPath, {
  recursive: true,
  filter: /\.pug$/,
}, async (event, name) => {
  await rebuildHTML(name);
  browserSync.reload();
});

watch(srcPath, {
  recursive: true,
  filter: /\.jpg$|\.png$|\.ico$/,
}, async (event, name) => {
  await rebuildIMG(name);
  browserSync.reload();
});

watch(srcPath, {
  recursive: true,
  filter: /\.js$/,
}, async (event, name) => {
  await rebuildJS(name);
  browserSync.reload();
});

watch(srcPath, {
  recursive: true,
  filter: /\.woff$|\.woff2$|\.ttf$|\.json$/,
}, async (event, name) => {
  await rebuildSTATIC(name);
  browserSync.reload();
});
