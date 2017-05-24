/* eslint no-console: 0 */
const util = require('util');

const Levels = {
  DEBUG: 3,
  INFO: 2,
  ERROR: 1,
  OFF: 0
};

class Logger {
  constructor(level) {
    if (typeof level === 'string') {
      level = Levels[level.toUpperCase()]
    }
    this._level = level || Levels.DEBUG;
  }

  error(fmt, ...args) {
    if (this._level < Levels.ERROR) {
      return;
    }
    const isoDate = new Date().toISOString();
    const result = util.format(fmt, ...args);
    console.log(isoDate, 'ERROR', result);
  }

  info(fmt, ...args) {
    if (this._level < Levels.INFO) {
      return;
    }
    const isoDate = new Date().toISOString();
    const result = util.format(fmt, ...args);
    console.log(isoDate, 'INFO', result);
  }

  debug(fmt, ...args) {
    if (this._level < Levels.DEBUG) {
      return;
    }
    const isoDate = new Date().toISOString();
    const result = util.format(fmt, ...args);
    console.log(isoDate, 'DEBUG', result);
  }
}

module.exports = Logger;