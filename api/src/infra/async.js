/* eslint-disable */
/**
 * Execute a series of async callbacks
 * @param {Function<Promise>[]} callbacks
 * @returns {Promise}
 */
function series(callbacks) {
  return _series(callbacks, 0);
}
exports.series = series;

function _series(callbacks, index, previousResult) {
  if (!callbacks || callbacks.length < 1) {
    return Promise.resolve();
  }
  let result;
  try {
    const callback = callbacks[index];
    result = callback(previousResult);
  } catch (err) {
    return Promise.reject(err);
  }
  const resultPromise = Promise.resolve(result);
  if ((index + 1) >= callbacks.length) {
    return resultPromise;
  }
  return resultPromise
    .then(r => _series(callbacks, index + 1, r));
}

/**
 * @callback forEachCallback
 * @param {*} currentValue
 * @param {Number} index
 * @return {Promise}
 */
/**
 * Async forEach
 * @param {Iterable<*>}     iterable    Object to iterate over
 * @param {forEachCallback} callback    Async callback (currentValue, index) => Promise
 * @returns {Promise}
 */
function forEach(iterable, callback) {
  const _callbacks = [];
  let index = 0;
  for (let value of iterable) {
    _callbacks.push(() => callback(value, index++));
  }
  return _series(_callbacks, 0);
}
exports.forEach = forEach;

/**
 * @callback reduceCallback
 * @param {*} accumulator
 * @param {*} currentValue
 * @param {Number} currentIndex
 * @returns {Promise<*>}
 */
/**
 * Async reduce
 * @param {Iterable<*>}     iterable        Object to iterate over
 * @param {reduceCallback}  callback        Async callback (accumulator, currentValue) => Promise
 * @param {*}               initialValue    Initial value
 * @returns {Promise<*>}
 */
function reduce(iterable, callback, initialValue) {
  const _callbacks = [];
  let index = 0;
  for (let value of iterable) {
    _callbacks.push(previousState => callback(previousState, value, index++));
  }
  return _series(_callbacks, 0, initialValue);
}
exports.reduce = reduce;

/**
 * @callback mapCallback
 * @param {*} currentValue
 * @param {Number} index
 * @returns {Promise<*>}
 */
/**
 * Async map
 * @param {Iterable<*>}     iterable
 * @param {mapCallback}     callback
 * @returns {Promise<[*]>}
 */
function map(iterable, callback) {
  const _callbacks = [];
  let index = 0;
  for (let value of iterable) {
    _callbacks.push(results =>
      Promise
        .resolve(callback(value, index++))
        .then(result => {
          results.push(result);
          return results;
        }));
  }
  return _series(_callbacks, 0, []);
}
exports.map = map;

/**
 * Generate a defer object
 * @returns {{promise: Promise, resolve: function, reject: function}}
 */
function defer() {
  const defer = {};
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
}
exports.defer = defer;