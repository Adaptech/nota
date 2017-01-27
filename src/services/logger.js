const util = require('util');

class Logger {
    static error(fmt /*, ...args */) {
        const isoDate = new Date().toISOString();
        const result = util.format.apply(this, Array.prototype.slice.call(arguments, 0));
        console.log(isoDate, 'ERROR', result);
    }

    static info(fmt /*, ...args */) {
        const isoDate = new Date().toISOString();
        const result = util.format.apply(this, Array.prototype.slice.call(arguments, 0));
        console.log(isoDate, 'INFO', result);
    }

    static debug(fmt /*, ...args */) {
        const isoDate = new Date().toISOString();
        const result = util.format.apply(this, Array.prototype.slice.call(arguments, 0));
        console.log(isoDate, 'DEBUG', result);
    }

    static access(fmt /*, ...args */) {
        const isoDate = new Date().toISOString();
        const result = util.format.apply(this, Array.prototype.slice.call(arguments, 0));
        console.log(isoDate, 'ACCESS', result);
    }
}

module.exports = Logger;