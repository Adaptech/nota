const path = require('path');
const express = require('express');
const _ = require('lodash');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

module.exports = function ({ app }) {
  const webpackBaseConfig = require('../config/webpack.config.dev.js')
  const webpackConfig = _.merge(_.cloneDeep(webpackBaseConfig), {
    devtool: 'source-map',
    entry: [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?reload=true',
      webpackBaseConfig.entry
    ],
    output: {
      path: '/',
      filename: 'bundle.js',
      publicPath: '/js/'
    },
    plugins: (webpackBaseConfig.plugins || []).concat([new webpack.HotModuleReplacementPlugin()])
  });
  const webpackDevServerConfig = {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    quiet: false,
    lazy: false,
    stats: { colors: true }
  };

  // serve the content using webpack and the dev server
  const compiler = webpack(webpackConfig);
  const middleware = webpackMiddleware(compiler, webpackDevServerConfig);
  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
};
