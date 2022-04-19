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

module.exports = {
  mode: 'development',
  entry:  path.resolve(process.cwd(), 'app', 'app.js'),
  output: {
    filename: '[name].bundle.js',
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
