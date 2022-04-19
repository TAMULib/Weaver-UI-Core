/**
 * Custom entry point
 */
//  module.exports = {
//   mode: 'development',
//   entry: './app/app.js'
// }

/**
 * A bit more customization...
 */
const path = require('path');
const ConcatPlugin = require('@mcler/webpack-concat-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

let appBuildConfig = require(path.resolve(process.cwd(), '.wvr', 'build-config.js')).config;
appBuildConfig = !!appBuildConfig ? appBuildConfig : {};

const vendorBundle = appBuildConfig.overrideVendorBunlde 
  ? appBuildConfig.vendorBundle 
  : [[]].concat(appBuildConfig.vendorBundle);
const wvrBundle = appBuildConfig.overrideWvrBunlde
  ? appBuildConfig.wvrBundle 
  : [[]].concat(appBuildConfig.wvrBundle);
const appBundle = appBuildConfig.overrideAppBunlde 
  ? appBuildConfig.appBundle
  : [
      [
        path.resolve(process.cwd(), 'app', '**', '*.js'), 
        `!${path.resolve(process.cwd(), 'app', 'config', 'appConfig.js')}`,
        `!${path.resolve(process.cwd(), 'app', 'config', 'apiMapping.js')}`,
        `!${path.resolve(process.cwd(), 'app', 'resources', '**', '*')}`
      ]
    ].concat(appBuildConfig.appBundle);

const plugins = []
if(vendorBundle.length) {
  plugins.push(new ConcatPlugin({
    name: 'vendor.bundle',
    outputPath: '.',
    fileName: '[name].js',
    filesToConcat: vendorBundle,
    attributes: {
        async: true
    }
  }));
}

if(wvrBundle.length) {
  plugins.push(new ConcatPlugin({
    name: 'wvr.bundle',
    outputPath: '.',
    fileName: '[name].js',
    filesToConcat: wvrBundle,
    attributes: {
        async: true
    }
  }));
}

if(appBundle.length) {
  plugins.push(new ConcatPlugin({
    name: 'app.bundle',
    outputPath: '.',
    fileName: '[name].js',
    filesToConcat: appBundle,
    attributes: {
        async: true
    }
  }));
}

plugins.push(
  new CopyPlugin({
  patterns: [
    { from: path.resolve(process.cwd(), 'app/index.html'), to: path.resolve(process.cwd(), 'dist/index.html') },
    { from: path.resolve(process.cwd(), 'app/resources'), to: path.resolve(process.cwd(), 'dist/resources') }
  ],
}));

plugins.push(new RemovePlugin({
  after: {
    // expects what your output folder is `dist`.
    include: [
      path.resolve(process.cwd(), 'dist', 'main.js')
    ]
  }
}));

module.exports = {
  mode: 'development',
  plugins,
  output: {
    path: path.resolve(process.cwd(), 'dist')
  },
  resolve: {
    modules: [
      'node_modules', // The default
      'app'
    ]
  }
}

/**
 * Production-like config
 */
// const path = require('path');

// module.exports = {
//   mode: 'production',
//   entry: 'main.js',
//   output: {
//     filename: '[name].[hash].bundle.js',
//     path: path.resolve(__dirname, 'build')
//   },
//   resolve: {
//     modules: [
//       'node_modules', // The default
//       'src'
//     ]
//   }
// }

/**
 * Gosh, we basically have two configs.
 * 
 * NOTE: When in production mode, minimization happens automatically.
 */
// const path = require('path');

// const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// module.exports = {
//   mode: nodeEnv,
//   entry: 'main.js',
//   output: {
//     filename: nodeEnv === 'production' ? '[name].[hash].bundle.js' : '[name].bundle.js',
//     path: path.resolve(__dirname, 'build')
//   },
//   resolve: {
//     modules: [
//       'node_modules', // The default
//       'src'
//     ]
//   }
// }
