const path = require('path');
const webpack = require('webpack');
const wpmerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const Visualizer = require('webpack-visualizer-plugin2');
var cliArgs = require('./utils/CliArgs');
var pkgJson = require('./package.json');

var debug = false;
if(cliArgs['dev'])
  debug = true;

var buildTime = (new Date()).getTime();

var webpackModuleConfigs = [
  {
    entry: './src/main',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'powfaucet.js'
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'powfaucet.css',
        chunkFilename: 'powfaucet.[name].css',

      }),
    ]
  },
  {
    entry: './src/worker/worker-scrypt',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'powfaucet-worker-sc.js',
    },
  },
  {
    entry: './src/worker/worker-cryptonight',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'powfaucet-worker-cn.js',
    },
  },
  {
    entry: './src/worker/worker-argon2',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'powfaucet-worker-a2.js',
    },
  },
  {
    entry: './src/worker/worker-nickminer',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'powfaucet-worker-nm.js',
    },
  },
];

var webpackBaseConfig = {
  mode: debug ? "development" : "production",
  devtool: "source-map",

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  target: ['web', 'es5'],

  module: {
    rules: [
      // babel-loader to load our jsx and tsx files
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/syntax-dynamic-import",
              "@babel/proposal-class-properties",
              "@babel/proposal-object-rest-spread",
              "@babel/plugin-syntax-flow"
            ]
          },
        },
      }
    ]
  },

  optimization: debug ? undefined : {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: {
          banner: '@pow-faucet-client: ' + JSON.stringify({
            version: pkgJson.version,
            build: buildTime,
          }) + "\n",
        },
        terserOptions: {
          compress: true,
          keep_fnames: false,
          mangle: true,
          toplevel: true,
          module: true,
        }
      }),
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      FAUCET_CLIENT_VERSION: JSON.stringify(pkgJson.version),
      FAUCET_CLIENT_BUILDTIME: buildTime,
    }),
    new Visualizer({
      filename: 'webpack-stats.html'
    })
  ]
};



module.exports = webpackModuleConfigs.map(function(moduleConfig) {
  return wpmerge.merge(webpackBaseConfig, moduleConfig);
});
