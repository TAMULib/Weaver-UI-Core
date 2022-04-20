console.log("\n\n\nBUILDING 5\n\n\n");
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const TerserPlugin = require("terser-webpack-plugin");
const extract = require("webpack-extract-module-to-global");
const CopyPlugin = require("copy-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

const TEMP_DIR = './bld-tmp';

let appBuildConfig = require(path.resolve(process.cwd(), '.wvr', 'build-config.js')).config;
appBuildConfig = !!appBuildConfig ? appBuildConfig : {};

const { entry } = appBuildConfig;

Object.keys(entry)
  .forEach(bundle => {
    const prune = [];
    entry[bundle] = entry[bundle].filter((e => {
      if (e.startsWith('!')) {
        prune.push(e.substring(1));
        return false;
      }
      return true;
    })).flatMap((e) => {
      return glob.sync(e);
    }).filter((e) => {
      return prune.indexOf(e) < 0;
    });
  }); 

if (fs.existsSync(TEMP_DIR)) {
  fs.rmdirSync(TEMP_DIR, { recursive: true, force: true });
  
}
fs.mkdirSync(TEMP_DIR);

const orderPaths = (scope, paths) => {
  const array = [];
  var i = 0;
  for (const path of paths) {
    const index = `${i}`.padStart(8, '0');
    fs.copyFileSync(path, `${TEMP_DIR}/${scope}-${index}.js`);
    array.push(`${TEMP_DIR}/${scope}-${index}.js`);
    i++;
  }
  return array;
}


const env = process.env.NODE_ENV || 'development';

module.exports = {
  mode: env,
  devtool: env === 'development' ? 'source-map' : 'none',
  context: process.cwd(),
  entry: {
    vendor: orderPaths('vendor', entry.vendor),
    wvr: orderPaths('wvr', entry.wvr),
    app: orderPaths('app', entry.app)
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
  },
  optimization: {
    minimize: env === 'production',
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve('app/index.html'), to: path.resolve('dist', 'index.html') },
        { from: path.resolve('app/resources'), to: path.resolve('dist', 'resources') }
      ]}),
    // new RemovePlugin({
    //     after: {
    //       include: [
    //         path.resolve(process.cwd(), TEMP_DIR)
    //       ]
    //     }
    //   })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: extract.ExtractModuleToGlobal.loader,
          },
        ],
      },
    ]
  },
  resolve: {
    modules: [
      'node_modules',
      'app'
    ]
  }
}
