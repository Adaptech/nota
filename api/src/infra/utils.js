const {randomBytes} = require('crypto');

exports.getTypeName = function getTypeName(obj) {
  if (obj && obj.constructor && obj.constructor.name) {
    return obj.constructor.name;
  }
  return typeof obj;
};

const POSSIBLE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.generateRandomCode = function generateRandomCode(length) {
  let buf = randomBytes(length);
  let chars = [];
  for (let i = 0; i < length; i++) {
    const ch = buf[i] % 36;
    chars.push(POSSIBLE_CHARS[ch]);
  }
  return chars.join('');
};

function newCall(Cls, args) {
  return new (Function.prototype.bind.apply(Cls, [Cls].concat(args)));
}

exports.newInject = function newInject(Cls, services, throwOnMissing) {
  const code = Cls.toString();
  const m = code.match(new RegExp('(' + Cls.name + '|constructor)\\(([^)]+)\\)'));
  if (!m || !m[2]) {
    throw new Error('Couldn\'t parse class ' + Cls.name + ' constructor.');
  }
  const params = m[2].split(',');
  const args = params.map(param => {
    const p = param.trim();
    return services[p];
  });
  const missingParams = args.reduce((a, c, i) => {
    if (c === undefined) {
      a.push(params[i].trim());
    }
    return a;
  }, []).join(', ');
  if (missingParams.length > 0 && throwOnMissing) {
    throw new Error(`Missing services for injection: ${missingParams}`);
  }
  return newCall(Cls, args);
};

const Operators = {
  $eq: function(left, right) {
    return left == right;
  },
  $neq: function(left, right) {
    return left != right;
  },
  $lt: function(left, right) {
    return left < right;
  },
  $lte: function(left, right) {
    return left <= right;
  },
  $gt: function(left, right) {
    return left > right;
  },
  $gte: function(left, right) {
    return left >= right;
  },
  $inq: function(left, right) {
    return right.includes(left);
  },
  $between: function(left, right) {
    return left >= right[0] && left <= right[1];
  },
  $ilike: function(left, right) {
    return left && right.test(left)
  },
  $and: function(item, filters) {
    return filters.every(f => f(item));
  },
  $or: function(item, filters) {
    return filters.some(f => f(item));
  }
};
// Loopback operators compatibility
Operators.and = Operators.$and;
Operators.or = Operators.$or;
Operators.gt = Operators.$gt;
Operators.gte = Operators.$gte;
Operators.lt = Operators.$lt;
Operators.lte = Operators.$lte;
Operators.between = Operators.$between;
Operators.ilike = Operators.$ilike;
Operators.inq = Operators.$inq;

function _mapFilter(field, value) {
  let operatorFn = Operators.$eq;
  if (Array.isArray(value)) {
    operatorFn = Operators[field] || Operators.$and;
    const filters = value.reduce((a, v) => {
      a.push(_mapFilters(v)[0]);
      return a;
    }, []);
    return function(x) {
      return operatorFn(x, filters)
    }
  } else if (value && typeof value === 'object') {
    const operatorName = Object.getOwnPropertyNames(value)[0];
    value = value[operatorName];
    operatorFn = Operators[operatorName] || Operators.$eq;
  }
  if (operatorFn === Operators.$ilike) {
    const pattern = value.replace(/_/g, '.').replace(/%/g, '.*');
    value = new RegExp(`^${pattern}$`, 'i');
  }
  return function(x) {
    return operatorFn(x[field], value);
  }
}

function _mapFilters(constraints) {
  return Object.getOwnPropertyNames(constraints)
    .map(field => _mapFilter(field, constraints[field]));
}

exports.filter = function(rows, constraints) {
  if (!rows || rows.length === 0 || !constraints) {
    return rows;
  }
  const filters = _mapFilters(constraints);
  return filters.reduce(function(results, f) {
    return results.filter(f);
  }, rows);
};

exports.parseCommandLine = function(def, argv) {
  let option = '';
  argv = argv || process.argv;
  return argv.slice(2)
    .reduce((options, arg) => {
      if (arg[0] === '-') {
        option = def[arg.substr(1)];
        options[option] = true;
        return options;
      }
      if (option) {
        options[option] = arg;
        option = '';
        return options;
      }
      options.$args.push(arg);
      return options;
    }, {$args: []});
};

/**
 * Deep resolve (as in Promise.resolve) all properties of a non-null object
 * @param {object} obj Object
 * @returns {Promise.<object>}
 */
function deepResolve(obj) {
  if (typeof obj !== 'object') {
    return Promise.reject(new Error(`Parameter is not an object: typeof = ${typeof obj}`))
  }
  if (obj === null) {
    return Promise.reject(`Parameter is null.`)
  }
  return _resolve(obj, new (obj.constructor));
}
exports.deepResolve = deepResolve;

function _resolve(obj, resolvedObject) {
  const promises = [];
  for (let prop in obj) {
    const propValue = obj[prop];
    if (propValue && propValue.then) {
      promises.push(propValue.then(value => {
        resolvedObject[prop] = value;
      }));
    } else if (Array.isArray(propValue)) {
      promises.push(_resolve(propValue, []).then(value => {
        resolvedObject[prop] = value;
      }));
    } else if (propValue && typeof propValue === 'object') {
      promises.push(_resolve(propValue, {}).then(value => {
        resolvedObject[prop] = value;
      }));
    } else {
      resolvedObject[prop] = obj[prop];
    }
  }
  return Promise.all(promises).then(() => resolvedObject);
}

/**
 * Turns a function requiring a node-style callback as its last parameter into a function that returns a promise
 * @param fn
 */
function promisify(fn) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return new Promise((resolve, reject) => {
      function cb(err, value) {
        if (err) {
          return reject(err);
        }
        resolve(value);
      }

      args.push(cb);
      fn.apply(this, args);
    });
  }
}
exports.promisify = promisify;

function promisifyInstance(obj, props) {
  for (let k of props) {
    const fn = obj[k];
    if (typeof fn === 'function') {
      obj[k] = promisify(fn).bind(obj);
    }
  }
  return obj;
}
exports.promisifyInstance = promisifyInstance;

const uriRegEx = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
const parseUri = (uri) => {
  const parts = uriRegEx.exec(uri);
  if (!parts || !parts[2] || !parts[4] || !parts[5]) throw new Error(`Wrong format for uri.`);
  const schema = parts[2];
  const domain = parts[4];
  const path = parts[5];

  const atPos = domain.indexOf('@');
  const credentials = atPos > 0 ? domain.substr(0, atPos) : '';
  const colonPos = domain.indexOf(':');
  const port = colonPos > 0 ? parseInt(domain.substr(colonPos + 1), 10) : 0;
  const hostStart = atPos < 1 ? 0 : atPos + 1;
  const hostEnd = colonPos < 0 ? domain.length : colonPos;
  const host = domain.substr(hostStart, hostEnd - hostStart);

  return {
    schema,
    credentials,
    host,
    port,
    path
  }
};
exports.parseUri = parseUri;