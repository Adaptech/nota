if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary)); console.log();
  errors.forEach(err => { console.log(err.message || err); console.log(); });
}

fs.copySync(path.resolve(__dirname, '..', 'assets'), path.resolve(__dirname, '..', 'dist'));

console.log('Creating an optimized production build...');

const webpackConfig = require('../config/webpack.config.prod.js');
let compiler;
try { compiler = webpack(webpackConfig); }
catch (err) {
  printErrors('Failed to compile.', [err]);
  process.exit(1);
}

fs.emptyDirSync(webpackConfig.output.path);
compiler.run((err, stats) => {
  if (err) {
    console.log('Failed to compile.', [err]);
    process.exit(1);
  }

  if (stats.compilation.errors.length) {
    printErrors('Failed to compile.', stats.compilation.errors);
    process.exit(1);
  }

  if (process.env.CI && stats.compilation.warnings.length) {
    printErrors(
      'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
      stats.compilation.warnings
    );
    process.exit(1);
  }

  console.log(chalk.green('Compiled successfully.'));
  console.log();
});
