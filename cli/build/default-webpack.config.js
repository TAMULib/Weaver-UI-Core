const fs = require('fs');
const glob = require('glob');
const path = require('path');
const extract = require("webpack-extract-module-to-global");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

const TEMP_DIR = './bld-tmp';

let appBuildConfig = require(path.resolve(process.cwd(), '.wvr', 'build-config.js')).config;
appBuildConfig = !!appBuildConfig ? appBuildConfig : {
  entry: {}
};

const { entry, copy } = appBuildConfig;

const patterns = [];

copy.forEach(c => {
  patterns.push({
    from: path.resolve(c.from),
    to: path.resolve('dist', c.to),
  });
});

if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_DIR);

const orderPaths = (scope, paths) => {
  const array = [];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const ext = path.split('.').pop();
    // es5 JavaScript requires correct order for concatenation
    if (ext === 'js') {
      const index = `${i}`.padStart(8, '0');
      const tempFilePath = `${TEMP_DIR}/${scope}-${index}.${ext}`;
      if (!fs.existsSync(path)) {
        console.error(`${path} does not exist!`);
      }
      fs.copyFileSync(path, tempFilePath);
      array.push(tempFilePath);
    } else {
      array.push(path);
    }
  }
  return array;
}

for (const bundle of Object.keys(entry)) {
  const prune = [];
  entry[bundle] = orderPaths(bundle, entry[bundle].filter((e => {
    if (e.startsWith('!')) {
      prune.push(e.substring(1));
      return false;
    }
    return true;
  })).flatMap((e) => {
    return glob.sync(e);
  }).filter((e) => {
    return prune.indexOf(e) < 0;
  }));
}

const env = process.env.NODE_ENV || 'development';

module.exports = {
  mode: env,
  target: ['web', 'es5'],
  devtool: env === 'development' ? 'source-map' : undefined,
  context: process.cwd(),
  entry,
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
  },
  optimization: {
    minimize: env === 'production',
    minimizer: [new TerserPlugin()],
  },
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
    new RemovePlugin({
      after: {
        include: [
          path.resolve(process.cwd(), TEMP_DIR)
        ],
        log: false,
        logWarning: true,
        logError: true,
        logDebug: false
      }
    })
  ],
}
