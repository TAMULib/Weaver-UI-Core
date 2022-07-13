const path = require('path');
const webpack = require('webpack');
const clean = require('../clean/clean.js');

// The build command
const build = (args) => {
  if (args['--clean'] || args['-x']) {
    clean.run([]);
  }

  console.log('Building...');

  const customConf = args['--config'] || args['-c'];

  const configLocation = customConf
    ? path.resolve(process.cwd(), customConf)
    : '../default-webpack.config.js';

  const webpackConfig = require(configLocation);

  const compiler = webpack(webpackConfig, (error, stats) => {
    if (!!error) {
      console.log(error);
    }
    if (!!stats.errors && stats.errors.length > 0) {
      console.log(stats.errors);
    }
  });

  return {
    webpackConfig,
    compiler,
  };
};

// The help text
const help = () => {
  console.log('wrv build [--help (-h), --dev (-d), --watch (-w), --prod (-p), --config (-c), --clean (-x)]');
}

// The run command
const run = (args) => {
  if (args['-h' || args['--help']]) {
    help();
  } else {
    build(args);
  }
};

exports.help = help;
exports.run = run;
