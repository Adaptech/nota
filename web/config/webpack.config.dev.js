const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const APP_PATH = path.resolve(__dirname, '..', 'src');

module.exports = {
  entry: path.join(APP_PATH, `index.jsx`),
  output: {
    path: path.join(__dirname, '..', 'dist', 'js'),
    filename: 'bundle.js'
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'eslint-loader', enforce: 'pre' },
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader', include: APP_PATH },
      { test: /\.(css|less)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: { plugins: () => [autoprefixer({ browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']})] },
          },
          'less-loader'
        ]
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg|jpg|png)$/, loader: 'file-loader' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3001/api/v1'),
      }
    }),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
