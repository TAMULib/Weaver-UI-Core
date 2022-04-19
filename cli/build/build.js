const webpack = require('webpack');

const build = (args) => {
  const customConf = args["--config"] || args["-c"];
  const configLocation = customConf ? process.cwd() + customConf : './default-webpack.config.js';
  const config = require(configLocation);
  webpack(config, (err, stats) => { // [Stats Object](#stats-object)
    if (err || stats.hasErrors()) {
     console.log(err);
    }
    console.log(config);
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
  console.log('wrv build [--help (-h), --dev (-d), --watch (-w), --prod (-p), --config (-c)]');
}

exports.run = run;
exports.help = help;
