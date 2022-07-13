const Webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');

function start(args) {
  console.log('Starting...');

  const customConf = args['--config'] || args['-c'];
  const port = args['-p'] || args['--port'] || 8080;

  const configLocation = customConf
    ? path.resolve(process.cwd(), customConf)
    : '../default-webpack.config.js';

  const webpackConfig = require(configLocation);

  const devServerOptions = {
    ...webpackConfig.devServer,
    port,
  };

  const compiler = Webpack(webpackConfig);
  const server = new WebpackDevServer(devServerOptions, compiler);

  server.startCallback(() => {
    console.log('Successfully started server');
  });
}

// The help text
function help() {
  console.log("wrv server [--help (-h), --config (-c), -p [port], -b [base url]]");
}

// The run command
function run(args) {
  if (args['-h' || args['--help']]) {
    help();
  } else {
    start(args);
  }
}

exports.help = help;
exports.run = run;
