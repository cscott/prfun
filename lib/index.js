// Utility functions for ES6 Promises.

module.exports = function(Promise) {
  "use strict";

  if (!Promise) { Promise = global.Promise; }
  // Use Promise implementation from es6-shim if there isn't already one
  // installed.
  if (!Promise) { require('es6-shim'); Promise = global.Promise; }

  // ---------- collections --------------

  // Allow Promise.all to accept a promise for an array (or iterable).
  Promise.prototype.all = function() {
    var P = this.constructor || Promise;
    return this.then(function(value) {
      return P.all(value);
    });
  };

  // Like `Promise.all` but generate array from varargs
  Promise.join = function() {
    var P = this || Promise;
    return P.all(arguments);
  };

  // Applies the `callback` to the promised value of each element of the
  // promised array.  Returns a promise for an array of values; that is,
  // it implicitly applies `Promise.all` to resolve all promises returned
  // by the mapping function.
  Promise.prototype.map = function(callback, thisArg) {
    var P = this.constructor || Promise;
    return P.map(this, callback, thisArg);
  };

  var arrayMap = Array.prototype.map;
  Promise.map = function(pArray, callback, thisArg) {
    var P = this || Promise;
    return P.resolve(pArray).then(function(arr) {
      return P.all(arrayMap.call(arr, function(pElem, index, arr_) {
        return P.resolve(pElem).then(function(elem) {
          var t = (thisArg === undefined) ? this : thisArg;
          return callback.call(t, elem, index, arr_);
        });
      }));
    });
  };

  // Like `Promise.all` but for object properties instead of array items.
  Promise.prototype.props = function() {
    var P = this.constructor || Promise;
    return P.props(this);
  };

  Promise.props = function(pObj) {
    var P = this || Promise;
    return P.resolve(pObj).then(function(obj) {
      var result = {};
      var keys = Object.keys(obj);
      if (Object(obj) !== obj) {
        // Object.keys accepts strings, numbers, etc in ES6.
        throw new TypeError('not an object');
      }
      return P.all(keys.map(function(k) { return obj[k]; })).
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
    var P = this.constructor || Promise;
    return this.then(function(value) {
      return P.race(value);
    });
  };

  // helper for reduce/reduceAll
  var reducer = function(P, callback) {
    return function(pPrev, pCurrent, index, arr) {
      return P.resolve(pPrev).then(function(prev) {
        return P.resolve(pCurrent).then(function(current) {
          return callback.call(this, prev, current, index, arr);
        });
      });
    };
  };

  // Reduce left-to-right an array which contains promises.
  Promise.prototype.reduce = function(callback) {
    var P = this.constructor || Promise;
    if (arguments.length <= 1) {
      return P.reduce(this, callback);
    } else {
      return P.reduce(this, callback, arguments[1]);
    }
  };

  var arrayReduce = Array.prototype.reduce;
  Promise.reduce = function(pArray, callback) {
    var P = this || Promise;
    if (arguments.length <= 2) {
      return P.resolve(pArray).then(function(arr) {
        return arrayReduce.call(arr, reducer(P, callback));
      });
    } else {
      var initialValue = P.resolve(arguments[2]);
      return P.resolve(pArray).then(function(arr) {
        return arrayReduce.call(arr, reducer(P, callback), initialValue);
      });
    }
  };

  // Reduce right-to-left an array which contains promises.
  Promise.prototype.reduceRight = function(callback) {
    var P = this.constructor || Promise;
    if (arguments.length <= 1) {
      return P.reduceRight(this, callback);
    } else {
      return P.reduceRight(this, callback, arguments[1]);
    }
  };

  var arrayReduceRight = Array.prototype.reduceRight;
  Promise.reduceRight = function(pArray, callback) {
    var P = this || Promise;
    if (arguments.length <= 2) {
      return P.resolve(pArray).then(function(arr) {
        return arrayReduceRight.call(arr, reducer(P, callback));
      });
    } else {
      var initialValue = P.resolve(arguments[2]);
      return P.resolve(pArray).then(function(arr) {
        return arrayReduceRight.call(arr, reducer(P, callback), initialValue);
      });
    }
  };

  Promise.prototype.spread = function(onFulfilled, onRejected) {
    var P = this.constructor || Promise;
    var f = onFulfilled ? function(pArgs) {
      return P.all(pArgs).then(function(args) {
        return onFulfilled.apply(this, args);
      });
    } : undefined;
    var r = onRejected ? function(pArgs) {
      return P.all(pArgs).then(function(args) {
        return onRejected.apply(this, args);
      });
    } : undefined;
    return this.then(f, r);
  };

  // ---------- Miscellaneous utility functions --------------

  // compatibility with q/when/jquery/etc.
  // use of this interface is discouraged.
  var Deferred = function Deferred() { };
  Object.defineProperties(Deferred.prototype, {
    resolver: {
      enumerable: true,
      get: function() {
        return { resolve: this.resolve, reject: this.reject };
      }
    },
    callback: {
      enumerable: true,
      get: function() {
        var resolve = this.resolve, reject = this.reject;
        return function(err, value) {
          if (err) { return reject(err); }
          return resolve(value);
        };
      }
    }
  });
  Promise.defer = function() {
    var P = this || Promise;
    var deferred = new Deferred();
    deferred.promise = new P(function(resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

  Promise.prototype.call = function(propertyName) {
    var P = this.constructor || Promise;
    var pArgs = Array.prototype.slice.call(arguments, 1);
    return this.then(function(obj) {
      return P.all(pArgs).then(function(args) {
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

  Promise.prototype.done = function() {
    if (arguments.length > 0) {
      // compatibility
      return this.then.apply(this, arguments).done();
    }
    this['catch'](function(e) {
      // throw from new scope to ensure the exception will be unhandled
      setTimeout(function() { throw e; }, 0);
    });
    // not chainable!
  };

  // ---------- Timeouts and delays --------------

  Promise.prototype.delay = function(ms) {
    var P = this.constructor || Promise;
    return P.delay(this, ms);
  };

  Promise.delay = function(pValue, ms) {
    var P = this || Promise;
    if (arguments.length===1) {
      ms = pValue;
      pValue = undefined;
    }
    return P.resolve(pValue).then(function(value) {
      return new P(function(resolve, reject) {
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
    var P = this.constructor || Promise;
    var promise = this;
    return new P(function(resolve, reject) {
      promise.then(resolve, reject);
      setTimeout(function() { reject(new TimeoutError(message)); }, ms);
    });
  };

  // ---------- try/caught/finally --------------

  Promise['try'] = function(fn, ctx /* ..args */) {
    var P = this || Promise;
    return P.all(arguments).then(function(args) {
      var fn = args[0], ctx = args[1], rest = args.slice(2);
      return new P(function(resolve, reject) {
        try {
          resolve(fn.apply(ctx, rest));
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
      /* jshint eqnull: true */
      var isErrorType = (v === Error) ||
        (v != null && v.prototype instanceof Error);
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
    return promise['catch'](function(e) {
      for (var i=0; i<predicates.length; i++) {
        if (predicates[i](e)) {
          return handler.call(this, e);
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
  Promise.prototype['finally'] = function(handler) {
    var promise = this;
    var P = this.constructor || Promise;
    return new P(function(resolve, reject) {
      promise.then(function(value) {
        var cb = function() { resolve(value); };
        P.resolve().then(handler).then(cb, reject);
      }, function(reason) {
        var cb = function() { reject(reason); };
        P.resolve().then(handler).then(cb, reject);
      });
    });
  };

  // ---------- wrappers and function-writing helpers --------------

  // Transparently handle synchronous exceptions and early returns.
  // This is like `Q.promised`.
  Promise.method = function(fn) {
    var P = this || Promise;
    if (typeof fn !== 'function') {
      throw new TypeError('must wrap a function'); // fail fast
    }
    return function() {
      var self = this;
      var args = [ fn, this ];
      Array.prototype.push.apply(args, arguments);
      return P['try'].apply(P, args);
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
          callback.call(this, null, v);
        } catch (e) {
          queueThrow(e);
        }
      }, function(r) {
        try {
          callback.call(this, r);
        } catch (e) {
          queueThrow(e);
        }
      });
    }
    return promise;
  };

  // Returns a function that wraps a given nodeFunction
  Promise.promisify = function(nodeFunction, optThis) {
    var P = this || Promise;
    var hasThis = (arguments.length > 1);
    return function() {
      var self = hasThis ? optThis : this;
      var args = Array.prototype.slice.call(arguments);
      return new P(function(resolve, reject) {
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

  // Guards: limit the amount of parallelism.

  // Implementation borrowed from:
  // https://github.com/cujojs/when/blob/master/guard.js
  // Authors: Brian Cavalier, John Hann, Sakari Jokinen
  // docs at: https://github.com/cujojs/when/blob/master/docs/api.md#whenguard

  /**
   * Creates a guarded version of f that can only be entered when the supplied
   * condition allows.
   * @param {function} condition represents a critical section that may only
   *  be entered when allowed by the condition
   * @param {function} f function to guard
   * @returns {function} guarded version of f
   */
  Promise.guard = function(condition, fn) {
    var P = this || Promise;
    if (typeof condition === 'number') {
      condition = P.guard.n(condition);
    }
    return function() {
      var self, args;

      self = this;
      args = arguments;

      return P.resolve(condition()).then(function(exit) {
        return P.resolve(fn.apply(self, args)).finally(exit);
      });
    };
  };

  /**
   * Creates a condition that allows only n simultaneous executions
   * of a guarded function
   * @param {number} allowed number of allowed simultaneous executions
   * @returns {function} condition function which returns a promise that
   *  fulfills when the critical section may be entered.  The fulfillment
   *  value is a function ("notifyExit") that must be called when the critical
   *  section has been exited.
   */
  Promise.guard.n = function (allowed) {
    var count, waiting;

    count = 0;
    waiting = [];

    var exit = function() {
      if (count > 0) {
        count--;
      }
      if(waiting.length) {
        waiting.shift()(exit);
      }
    };

    return function enter() {
      return new Promise(function(resolve) {
        if(count < allowed) {
          resolve(exit);
        } else {
          waiting.push(resolve);
        }
        count += 1;
      });
    };
  };

  // Promise#bind()
  // Idea borrowed from bluebird.
  Promise.bind = function(newThis) {
    return this.resolve().bind(newThis);
  };

  Promise.prototype.bind = function(newThis) {
    var SuperPromise = this._bindSuper || this.constructor || Promise;
    // create a new Promise subclass (this is less cumbersome in es6, sigh)
    var BoundPromise = function(exec) {
      return SuperPromise.call(this, exec);
    };
    Object.setPrototypeOf(BoundPromise, SuperPromise);
    BoundPromise.prototype = Object.create(SuperPromise.prototype);
    BoundPromise.prototype.constructor = BoundPromise;
    BoundPromise.prototype._bindSuper = SuperPromise;

    BoundPromise.prototype.then = (function(superThen) {
      return function(f, r) {
        var ff = f && f.bind(newThis);
        var rr = r && r.bind(newThis);
        return superThen.call(this, ff, rr);
      };
    })(BoundPromise.prototype.then);
    return newThis ? BoundPromise.resolve(this) : SuperPromise.resolve(this);
  };

  // Generators.
  // Implementation borrowed from Q.async()
  Promise.async = function(makeGenerator) {
    var P = this || Promise;
    return function() {
      var generator, callback, errback;
      // when verb is "send", arg is a value
      // when verb is "throw", arg is an exception
      function continuer(verb, arg) {
        var result;
        try {
          result = generator[verb](arg);
        } catch (exception) {
          return P.reject(exception);
        }
        // xxx: possibly check for array-like (or iterable) value and
        // use Promise.all() before returning/invoking callback?
        if (result.done) {
          return result.value;
        } else {
          return P.resolve(result.value).then(callback, errback);
        }
      }
      generator = makeGenerator.apply(this, arguments);
      callback = continuer.bind(continuer, "next");
      errback = continuer.bind(continuer, "throw");
      return callback();
    };
  };

  return Promise;
};
