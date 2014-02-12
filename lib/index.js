// Utility functions for ES6 Promises.

module.exports = function(Promise) {
  if (!Promise) { Promise = global.Promise; }
  // Use Promise implementation from es6-shim if there isn't already one
  // installed.
  if (!Promise) { require('es6-shim'); Promise = global.Promise; }

  // ---------- collections --------------

  // Allow Promise.all to accept a promise for an array (or iterable).
  Promise.prototype.all = function() {
    return Promise.cast(this).then(function(value) {
      return Promise.all(value);
    });
  };

  // Like `Promise.all` but generate array from varargs
  Promise.join = function() {
    return Promise.all(arguments);
  };

  // Applies the `callback` to the promised value of each element of the
  // promised array.  Returns a promise for an array of values; that is,
  // it implicitly applies `Promise.all` to resolve all promises returned
  // by the mapping function.
  Promise.prototype.map = function(callback, thisArg) {
    return Promise.map(this, callback, thisArg);
  };

  var arrayMap = Array.prototype.map;
  Promise.map = function(pArray, callback, thisArg) {
    return Promise.cast(pArray).then(function(arr) {
      return Promise.all(arrayMap.call(arr, function(pElem, index, arr_) {
        return Promise.cast(pElem).then(function(elem) {
          return callback.call(thisArg, elem, index, arr_);
        });
      }));
    });
  };

  // Like `Promise.all` but for object properties instead of array items.
  Promise.prototype.props = function() {
    return Promise.props(this);
  };

  Promise.props = function(pObj) {
    return Promise.cast(pObj).then(function(obj) {
      var result = {};
      var keys = Object.keys(obj);
      return Promise.all(keys.map(function(k) { return obj[k]; })).
        then(function(values) {
          keys.forEach(function(k, i) {
            result[k] = values[i];
          });
          return result;
        });
    });
  };

  // Allow Promise.race to accept a promise for an array (or iterable).
  Promise.prototype.race = function() {
    return Promise.cast(this).then(function(value) {
      return Promise.race(value);
    });
  };

  // helper for reduce/reduceAll
  var reducer = function(callback) {
    return function(pPrev, pCurrent, index, arr) {
      return Promise.cast(pPrev).then(function(prev) {
        return Promise.cast(pCurrent).then(function(current) {
          return callback(prev, current, index, arr);
        });
      });
    };
  };

  // Reduce left-to-right an array which contains promises.
  Promise.prototype.reduce = function(callback) {
    if (arguments.length <= 1) {
      return Promise.reduce(this, callback);
    } else {
      return Promise.reduce(this, callback, arguments[1]);
    }
  };

  var arrayReduce = Array.prototype.reduce;
  Promise.reduce = function(pArray, callback) {
    if (arguments.length <= 2) {
      return Promise.cast(pArray).then(function(arr) {
        return arrayReduce.call(arr, reducer(callback));
      });
    } else {
      var initialValue = Promise.cast(arguments[2]);
      return Promise.cast(pArray).then(function(arr) {
        return arrayReduce.call(arr, reducer(callback), initialValue);
      });
    }
  };

  // Reduce right-to-left an array which contains promises.
  Promise.prototype.reduceRight = function(callback) {
    if (arguments.length <= 1) {
      return Promise.reduceRight(this, callback);
    } else {
      return Promise.reduceRight(this, callback, arguments[1]);
    }
  };

  var arrayReduceRight = Array.prototype.reduceRight;
  Promise.reduceRight = function(pArray, callback) {
    if (arguments.length <= 2) {
      return Promise.cast(pArray).then(function(arr) {
        return arrayReduceRight.call(arr, reducer(callback));
      });
    } else {
      var initialValue = Promise.cast(arguments[2]);
      return Promise.cast(pArray).then(function(arr) {
        return arrayReduceRight.call(arr, reducer(callback), initialValue);
      });
    }
  };

  Promise.prototype.spread = function(onFulfilled, onRejected) {
    var f = onFulfilled ? function(pArgs) {
      return Promise.cast(pArgs).all().then(function(args) {
        return onFulfilled.apply(this, args);
      });
    } : undefined;
    var r = onRejected ? function(pArgs) {
      return Promise.cast(pArgs).all().then(function(args) {
        return onRejected.apply(this, args);
      });
    } : undefined;
    return this.then(f, r);
  };

  // ---------- Miscellaneous utility functions --------------

  Promise.prototype.call = function(propertyName) {
    var pArgs = Array.prototype.slice.call(arguments, 1);
    return this.then(function(obj) {
      return Promise.all(pArgs).then(function(args) {
        return obj[propertyName].apply(obj, args);
      });
    });
  };

  Promise.prototype.get = function(propertyName) {
    return this.then(function(obj) {
      return obj[propertyName];
    });
  };

  Promise.prototype['return'] = function(v) {
    return this.then(function() { return v; });
  };

  Promise.prototype['throw'] = function(e) {
    // ensure that e is resolved, if it is a promise.
    return this['return'](e).then(function(ee) { throw ee; });
  };

  // ---------- Timeouts and delays --------------

  Promise.prototype.delay = function(ms) {
    return Promise.delay(this, ms);
  };

  Promise.delay = function(pValue, ms) {
    return Promise.cast(pValue).then(function(value) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() { resolve(value); }, ms);
      });
    });
  };

  var TimeoutError = Promise.TimeoutError = function(message) {
    this.message = (typeof message === 'string') ? message : 'timeout';
    this.name = 'TimeoutError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  };
  TimeoutError.prototype = Object.create(Error.prototype);

  Promise.prototype.timeout = function(ms, message) {
    var promise = this;
    return new Promise(function(resolve, reject) {
      promise.then(resolve, reject);
      setTimeout(function() { reject(new TimeoutError(message)); }, ms);
    });
  };

  // ---------- try/caught/finally --------------

  Promise['try'] = function(fn, ctx /* ..args */) {
    var pArgs = Array.prototype.slice.call(arguments, 2);
    return Promise.all(pArgs).then(function(args) {
      return new Promise(function(resolve, reject) {
        try {
          resolve(fn.apply(ctx, args));
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  Promise.prototype.caught = function(predicate, handler) {
    var promise = this;
    if (arguments.length<=1) { return promise['catch'](predicate); }
    var predicates = Array.prototype.slice.call(arguments);
    handler = predicates.pop();
    predicates = predicates.map(function(v) {
      var isErrorType = (v===Error) || (v != null && v.prototype instanceof Error);
      if (isErrorType) {
        return function(e) { return (e instanceof v); };
      } else if (typeof v === 'function') {
        return function(e) { return !!v(e); };
      } else {
        return function(e) {
          throw new TypeError('caught filter must inherit from Error '+
                              'or be a simple predicate function');
        };
      }
    });
    return promise.catch(function(e) {
      for (var i=0; i<predicates.length; i++) {
        if (predicates[i](e)) {
          return handler(e);
        }
      }
      // re-throw
      throw e;
    });
  };

  // XXX The return semantics are a bit funny.
  // eg:
  // > f = function(g, h) { try { return g(); } finally { return h(); } };
  // > f(function(){return 1;}, function(){return 2;})
  // 2
  // > f(function(){return 1;}, function(){throw new Error('b');})
  // Error: b
  // This method would return '1' in the first case (but 'b' in the second).
  Promise.prototype.finally = function(handler) {
    var promise = this;
    return new Promise(function(resolve, reject) {
      promise.then(function(value) {
        var cb = function() { resolve(value); };
        Promise.cast().then(handler).then(cb, reject);
      }, function(reason) {
        var cb = function() { reject(reason); };
        Promise.cast().then(handler).then(cb, reject);
      });
    });
  };

  // ---------- wrappers and function-writing helpers --------------

  // Transparently handle synchronous exceptions and early returns.
  Promise.method = function(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('must wrap a function'); // fail fast
    }
    return function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      return new Promise(function(resolve, reject) {
        try {
          resolve(fn.apply(self, args));
        } catch (e) {
          reject(e);
        }
      });
    };
  };

  // Register a node-style callback on this promise.
  Promise.prototype.nodify = function(callback) {
    var promise = this;
    if (callback) {
      var queueThrow = function(e) {
        // don't let this exception get swallowed by the Promise handlers
        setTimeout(function() { throw e; }, 0);
      };
      promise.then(function(v) {
        try {
          callback(null, v);
        } catch (e) {
          queueThrow(e);
        }
      }, function(e) {
        try {
          callback(e);
        } catch (e) {
          queueThrow(e);
        }
      });
    }
    return promise;
  };

  // Returns a function that wraps a given nodeFunction
  Promise.promisify = function(nodeFunction, optThis) {
    var hasThis = (arguments.length > 1);
    return function() {
      var self = hasThis ? optThis : this;
      var args = Array.prototype.slice.call(arguments);
      return new Promise(function(resolve, reject) {
        args.push(function(e, v) {
          if (e) {
            reject(e);
          } else if (arguments.length > 2) {
            resolve(Array.prototype.slice.call(arguments, 1));
          } else {
            resolve(v);
          }
        });
        try {
          nodeFunction.apply(self, args);
        } catch(e) {
          reject(e);
        }
      });
    };
  };
};
