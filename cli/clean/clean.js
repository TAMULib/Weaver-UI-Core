const fs = require('fs');
const resolve = require('path').resolve;

let appBuildConfig = require(resolve(process.cwd(), '.wvr', 'build-config.js')).config;
appBuildConfig = !!appBuildConfig ? appBuildConfig : {
  path: 'dist',
  publicPath: '/',
  copy: [],
  entry: {},
};

const { path } = appBuildConfig;

const rmdir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const clean = (args) => {
  console.log('Cleaning...');
  rmdir(resolve(process.cwd(), path));
}

const run = (args) => {
  if (args['-h' || args['--help']]) {
    help();
  } else {
    clean(args);
  }
}

const help = () => {
  console.log('wrv clean []');
}

exports.help = help;
exports.run = run;
