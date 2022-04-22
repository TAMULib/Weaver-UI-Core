const webpack = require('webpack');
const clean = require('../clean/clean.js');

const build = (args) => {

  if (args["--clean"] || args["-x"]) {
    clean.run([]);
  }

  const customConf = args["--config"] || args["-c"];
  const configLocation = customConf ? process.cwd() + customConf : './default-webpack.config.js';
  const config = require(configLocation);
  webpack(config, (error, stats) => {
    if (!!error) {
      console.log(error);
    }
    if (!!stats.errors && stats.errors.length > 0) {
      console.log(stats.errors);
    }
  });
};

// The run command
const run = (args) => {
  if (!args['-h' || !args['--help']]) {
    build(args);
  } else {
    help();
  }
};

// The help text
const help = () => {
  console.log('wrv build [--help (-h), --dev (-d), --watch (-w), --prod (-p), --config (-c), --clean (-x)]');
}

exports.run = run;
exports.help = help;
