const path = require('path');
const pkg = require('./package.json');
const camelcase = require('camelcase');
const process = require('process');
const webpack = require('webpack');
const env = process.env;
const NODE_ENV = env.NODE_ENV;
const MIN = env.MIN;
const PROD = NODE_ENV === 'production';

let config = {
  devtool: PROD ? false : 'inline-source-map',
  entry: './src/index.js',
  output: {
    path: path.join( __dirname ),
    filename: pkg.name + '.js',
    library: camelcase( pkg.name ),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }
    ]
  },
  externals: PROD ? { 
    'numeric': {
      commonjs2: 'numeric',
      commonjs: 'numeric',
      amd: 'numeric',
      root: 'numeric'
    },
    'cytoscape-cose-bilkent': {
      commonjs2: 'cytoscape-cose-bilkent',
      commonjs: 'cytoscape-cose-bilkent',
      amd: 'cytoscape-cose-bilkent',
      root: 'cytoscape-cose-bilkent'
    }    
  } : {},
  plugins: MIN ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
      }
    })
  ] : []
};

module.exports = config;
