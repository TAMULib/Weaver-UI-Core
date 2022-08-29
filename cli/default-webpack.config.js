var fs = require('fs');
const glob = require('glob');
const join = require('path').join;
const resolve = require('path').resolve;
const extract = require("webpack-extract-module-to-global");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

let appBuildConfig = require(resolve(process.cwd(), '.wvr', 'build-config.js')).config;

appBuildConfig = !!appBuildConfig ? appBuildConfig : {
  path: 'dist',
  publicPath: '/',
  copy: [],
  entry: {},
  terserOptions: {},
  stats: {}
};

const { path = 'dist', publicPath = '/', copy = [], entry = {}, terserOptions = {}, stats = {} } = appBuildConfig;

const extractLoader = extract.ExtractModuleToGlobal.loader;

// prepare copy patterns to dist directory
const patterns = [];
copy.forEach(c => {
  const pattern = {
    from: resolve(c.from),
  };
  if (c.transform && c.transform instanceof Function) {
    pattern.transform = c.transform;
  }
  if (c.transformAll && c.transformAll instanceof Function) {
    pattern.transformAll = c.transformAll;
  }
  if (c.filter && c.filter instanceof Function) {
    pattern.filter = c.filter;
  }
  if (c.info && c.info instanceof Function) {
    pattern.info = c.info;
  }
  if (c.to && c.to instanceof Function) {
    pattern.to = c.to;
  } else {
    pattern.to = resolve(path, c.to);
  }
  patterns.push(pattern);
});

// configure weaver temp build directory
const tempPath = './.wvr/tmp';
if (fs.existsSync(tempPath)) {
  fs.rmSync(tempPath, { recursive: true });
}
fs.mkdirSync(tempPath, { recursive: true });

let i = 0;

for (const bundle of Object.keys(entry)) {
  if (bundle === 'mirador') {
    continue;
  }
  const prune = [];
  // extrapolate entry files per bundle
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
      // rename all js files to preserve order through build
      const entry = join(tempPath, `${(++i).toString().padStart(10, '0')}.js`);
      fs.copyFileSync(e, entry);
      return `!${extractLoader}?modules!${resolve(entry)}`;
    }
    return e;
  });
}

const env = process.env.NODE_ENV || 'development';

// see webpack https://webpack.js.org/configuration/
module.exports = {
  stats,
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
    client,
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
        terserOptions,
      }
    )],
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        type: 'asset/resource',
        generator: {
          filename: 'resources/styles/[name].css'
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
