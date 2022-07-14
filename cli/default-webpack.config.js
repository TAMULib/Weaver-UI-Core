const glob = require('glob');
const resolve = require('path').resolve;
const extract = require("webpack-extract-module-to-global");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

let appBuildConfig = require(resolve(process.cwd(), '.wvr', 'build-config.js')).config;
appBuildConfig = !!appBuildConfig ? appBuildConfig : {
  path: 'dist',
  publicPath: '/',
  copy: [],
  entry: {},
};

const extractLoader = extract.ExtractModuleToGlobal.loader;

const { path, publicPath, copy, entry } = appBuildConfig;

const patterns = [];

// prepare copy patterns to dist directory
copy.forEach(c => {
  const pattern = {
    from: resolve(c.from),
    to: resolve(path, c.to)
  };
  if (c.transform && c.transform instanceof Function) {
    pattern.transform = c.transform;
  }
  patterns.push(pattern);
});

for (const bundle of Object.keys(entry)) {
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
  }).map((e) => {
    const ext = e.split('.').pop();
    if (ext === 'js') {
      return `!${extractLoader}?modules!${e}`;
    }
    return e;
  });
}

const env = process.env.NODE_ENV || 'development';

// see webpack https://webpack.js.org/configuration/
module.exports = {
  mode: env,
  devtool: env === 'development' ? 'source-map' : undefined,
  context: process.cwd(),
  entry,
  experiments: {
    outputModule: true,
  },
  output: {
    path: resolve(process.cwd(), path),
    filename: '[name].bundle.js',
    module: true,
    publicPath,
  },
  devServer: {
    static: {
      directory: resolve(process.cwd(), path),
      serveIndex: true,
      publicPath,
    },
    hot: false,
    liveReload: false,
    compress: true,
    open: [publicPath],
    historyApiFallback: {
      index: `${publicPath}/index.html`
    },
  },
  optimization: {
    minimize: env === 'production',
    minimizer: [new TerserPlugin(
      {
        terserOptions: {
          ecma: '5',
          parse: {},
          compress: {},
          mangle: false,
          module: false
        },
      }
    )],
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        type: 'asset/resource',
        generator: {
          filename: 'resources/styles/app.css'
        },
        use: [
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
    ]
  },
  plugins: [
    new extract.ExtractModuleToGlobal(),
    new CopyPlugin({
      patterns,
    }),
  ],
}
