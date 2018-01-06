// Utility functions for ES6 Promises.

var FakeMap = function FakeMap() {
  'use strict';
  this.entries = [];
};
FakeMap.prototype._getEntry = function _getEntry(key) {
  'use strict';
  var entries = this.entries;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].key === key) { return entries[i]; }
  }
};
FakeMap.prototype.set = function set(key, value) {
  'use strict';
  var entry = this._getEntry(key);
  if (entry !== void 0) {
    entry.value = value;
  } else {
    this.entries.push({ key: key, value: value });
  }
};
FakeMap.prototype.get = function get(key) {
  'use strict';
  var entry = this._getEntry(key);
  if (entry !== void 0) {
    return entry.value;
  }
};

var makeMap = (function() {
  'use strict';
  var m = null;
  return function() {
    if (m === null) {
      m = global.Map ? new global.Map() : new FakeMap();
    }
    return m;
  };
})();

module.exports = function(ParentPromise, smash) {
  'use strict';

  if (!ParentPromise) { ParentPromise = global.Promise; }
  // Try to use Promise implementation from core-js if there isn't already one
  // installed.
  if (!ParentPromise) {
    try {
      ParentPromise = require('core-js/library/es6/promise');
      if (smash) {
        global.Promise = ParentPromise;
      }
    } catch (e) {
      throw new Error('No Promise implementation found. ' +
        "Install the optional dependencies to use core-js's Promises.");
    }
  }
  // Use cached PrFun promise if possible.
  var cache = makeMap();
  var PrFunPromise = smash ? null : cache.get(ParentPromise);
  if (PrFunPromise) { return PrFunPromise; }

  // Find an implementation of Object.setPrototypeOf
  var setPrototypeOf = Object.setPrototypeOf;
  if (!setPrototypeOf) {
    try {
      setPrototypeOf = require('core-js/library/es6/object').setPrototypeOf;
    } catch (e) {
      throw new Error('No implementation of Object.setPrototypeOf found. ' +
        "Install the optional dependencies to use core-js's implementation.");
    }
  }

  // Create a new Promise subclass (this is less cumbersome in es6!)
  var makeResolve = null;
  PrFunPromise = (function makeSubclass(ParentPromise) {
    var PrFunPromise;
    /* eslint-disable max-len */
    var isClass = function isClass(v) {
      // See: http://stackoverflow.com/questions/30758961/how-to-check-if-a-variable-is-an-es6-class-declaration
      // And: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-function.prototype.tostring
      return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
    };
    /* eslint-enable max-len */
    if (isClass(ParentPromise)) {
      // ES6 classes are currently unoptimized in V8.
      // So let's not use them unless ParentPromise does.
      try {
        return eval('(function(ParentPromise){' +
                    '"use strict";' +
                    'return class PrFunPromise extends ParentPromise {};' +
                    '})')(ParentPromise);
      } catch (e) { /* I guess true ES6 classes are not supported. */ }
    }
    // Try the "ES5 way"; this is fastest on ES5 engines.
    // (Faster even than ES6 classes, at least on node 5.x, but we assume
    // that the performance of native classes will catch up eventually.)
    PrFunPromise = function PrFunPromise(resolver) {
      ParentPromise.call(this, resolver);
    };
    setPrototypeOf(PrFunPromise, ParentPromise);
    PrFunPromise.prototype = Object.create(ParentPromise.prototype);
    PrFunPromise.prototype.constructor = PrFunPromise;
    // Try it out first.
    try {
      PrFunPromise.resolve(5);
      // Some native promise implementations will object to the "ES5 way".
      // If they didn't, then let's go with this version.
      return PrFunPromise;
    } catch (e) { /* I guess we'll use the "real" ES6-compatible way. */ }
    PrFunPromise = function PrFunPromise(exec) {
      var self = new ParentPromise(exec);
      setPrototypeOf(self, PrFunPromise.prototype);
      self._promiseConstructor = PrFunPromise;
      return self;
    };
    setPrototypeOf(PrFunPromise, ParentPromise);
    PrFunPromise.prototype = Object.create(ParentPromise.prototype);
    PrFunPromise.prototype.constructor = PrFunPromise;
    // This isn't quite right: the way we are creating the subclass
    // above doesn't set the internal [[PromiseConstructor]] field,
    // so we need to tweak the implementation of Promise.resolve()
    // (Note that [[PromiseConstructor]] has been removed from the
    // latest draft of the ES6 spec, but it may still be present in
    // your (buggy) native Promise implementation.)
    makeResolve = function(parentResolve) {
      return function(x) {
        if (x && typeof x === 'object' && x._promiseConstructor) {
          if (this === x._promiseConstructor) {
            return x;
          }
          return new this(function(r) { r(x); });
        }
        return parentResolve.call(this, x);
      };
    };
    return PrFunPromise;
  })(ParentPromise);

  if (makeResolve) {
    PrFunPromise.resolve = makeResolve(PrFunPromise.resolve);
  }

  // Sometimes we just need to smash things (sigh)
  var Promise = smash ? ParentPromise : PrFunPromise;

  // Sanity-check (warn users if this is all going to go pear-shaped)
  try {
    if (!(Promise.resolve(42) instanceof Promise)) {
      throw new Error('Bad implementation');
    }
  } catch (ex) {
    throw new Error('Bad Promise implementation: does not support ' +
      'ES6 subclassing.  Use prfun/smash.');
  }

  // ---------- then0 optimization -------

  // Certain promise implementations (ie, babybird) provide an implementation
  // of `then` which does not return a value.  This can be much faster than
  // the native `then`.  Shim it if not provided natively.
  if (!Promise.prototype.then0) {
    Promise.prototype.then0 = function(f,r) { this.then(f, r); };
  }
  // Marker property, to indicate that we don't do anything unsafe
  // in our constructor.
  Promise.noSideEffects = true;

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
    // It shouldn't be necessary to slice the arguments, but some
    // native Promise implementations don't recognize `arguments`
    // as an iterable
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }
    return P.all(args);
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

  // Applies the `callback` to the promised value of each element of
  // the promised array, and constructs a new array of all the values
  // for which callback returns a (promise of a) true value.
  Promise.prototype.filter = function(callback, thisArg) {
    var P = this.constructor || Promise;
    return P.filter(this, callback, thisArg);
  };

  Promise.filter = function(pArray, callback, thisArg) {
    var P = this || Promise;
    return P.resolve(pArray).then(function(arr) {
      var f = new Array(arr.length);
      return P.all(arrayMap.call(arr, function(pElem, index, arr_) {
        return P.resolve(pElem).then(function(elem) {
          var t = (thisArg === undefined) ? this : thisArg;
          var pBool = callback.call(t, elem, index, arr_);
          return P.resolve(pBool).then(function(bool) {
            f[index] = bool;
            return elem;
          });
        });
      })).then(function(resArr) {
        return resArr.filter(function(elem, index) { return f[index]; });
      });
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

  // Helper for reduce/reduceAll:
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
    }
    return P.reduce(this, callback, arguments[1]);
  };

  var arrayReduce = Array.prototype.reduce;
  Promise.reduce = function(pArray, callback) {
    var P = this || Promise;
    if (arguments.length <= 2) {
      return P.resolve(pArray).then(function(arr) {
        return arrayReduce.call(arr, reducer(P, callback));
      });
    }
    var initialValue = P.resolve(arguments[2]);
    return P.resolve(pArray).then(function(arr) {
      return arrayReduce.call(arr, reducer(P, callback), initialValue);
    });
  };

  // Reduce right-to-left an array which contains promises.
  Promise.prototype.reduceRight = function(callback) {
    var P = this.constructor || Promise;
    if (arguments.length <= 1) {
      return P.reduceRight(this, callback);
    }
    return P.reduceRight(this, callback, arguments[1]);
  };

  var arrayReduceRight = Array.prototype.reduceRight;
  Promise.reduceRight = function(pArray, callback) {
    var P = this || Promise;
    if (arguments.length <= 2) {
      return P.resolve(pArray).then(function(arr) {
        return arrayReduceRight.call(arr, reducer(P, callback));
      });
    }
    var initialValue = P.resolve(arguments[2]);
    return P.resolve(pArray).then(function(arr) {
      return arrayReduceRight.call(arr, reducer(P, callback), initialValue);
    });
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

  // Compatibility with q/when/jquery/etc.
  // Use of this interface is discouraged.
  var Deferred = function Deferred() { };
  Object.defineProperties(Deferred.prototype, {
    resolver: {
      enumerable: true,
      get: function() {
        return { resolve: this.resolve, reject: this.reject };
      },
    },
    callback: {
      enumerable: true,
      get: function() {
        var resolve = this.resolve;
        var reject = this.reject;
        return function(err, value) {
          if (err) { return reject(err); }
          return resolve(value);
        };
      },
    },
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
    var pArgs = new Array(arguments.length - 1);
    for (var i = 0; i < pArgs.length; ++i) {
      pArgs[i] = arguments[i + 1];
    }
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

  Promise.prototype.tap = function(handler) {
    var P = this.constructor || Promise;
    return this.then(function(v) {
      return P.resolve(handler(v))['return'](v);
    });
  };

  Promise.prototype['throw'] = function(e) {
    // Ensure that e is resolved, if it is a promise.
    return this['return'](e).then(function(ee) { throw ee; });
  };

  Promise.prototype.done = function() {
    if (arguments.length > 0) {
      // Compatibility with other libraries which allow arguments to #done()
      return this.then.apply(this, arguments).done();
    }
    this.then0(undefined, function(e) {
      // Throw from new scope to ensure the exception will be unhandled
      // (and thus reported).
      setTimeout(function() { throw e; }, 0);
    });
    // This function is not chainable!  Return `undefined`.
  };

  // ---------- Timeouts and delays --------------

  Promise.prototype.delay = function(ms) {
    var P = this.constructor || Promise;
    return P.delay(this, ms);
  };

  Promise.delay = function(pValue, ms) {
    var P = this || Promise;
    if (arguments.length === 1) {
      ms = pValue;
      pValue = undefined;
    }
    return P.resolve(pValue).then(function(value) {
      return new P(function(resolve, reject) { // eslint-disable-line
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

  var makeRejector = function(reject, message, ms) {
    // Create this function in an outer scope so that we don't inadvertently
    // keep a reference to the promise here.  Perhaps this is overkill.
    var id = setTimeout(function() { reject(new TimeoutError(message)); }, ms);
    return function() { clearTimeout(id); };
  };
  Promise.prototype.timeout = function(ms, message) {
    var P = this.constructor || Promise;
    var promise = this;
    return new P(function(resolve, reject) {
      promise.then0(resolve, reject);
      var cleanup = makeRejector(reject, message, ms);
      promise.then0(cleanup, cleanup);
    });
  };

  // ---------- try/caught/finally --------------

  Promise['try'] = function(fn, ctx /* ..args */) { // eslint-disable-line
    var P = this || Promise;
    // It shouldn't be necessary to slice the arguments, but some
    // native Promise implementations don't recognize `arguments`
    // as an iterable.
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }
    return P.all(args).then(function(args) {
      var fn = args[0];
      var ctx = args[1];
      var rest = args.slice(2);
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
    if (arguments.length <= 1) { return promise['catch'](predicate); }
    var predicates = new Array(arguments.length);
    for (var i = 0; i < predicates.length; ++i) {
      predicates[i] = arguments[i];
    }
    handler = predicates.pop();
    predicates = predicates.map(function(v) {
      var isErrorType = (v === Error) ||
        (v != null && v.prototype instanceof Error);
      if (isErrorType) {
        return function(e) { return (e instanceof v); };
      }
      if (typeof v === 'function') {
        return function(e) { return !!v(e); };
      }
      return function(e) { // eslint-disable-line
        throw new TypeError('caught filter must inherit from Error ' +
                            'or be a simple predicate function');
      };
    });
    return promise['catch'](function(e) {
      for (var i = 0; i < predicates.length; i++) {
        if (predicates[i](e)) {
          return handler.call(this, e);
        }
      }
      // Re-throw
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
      promise.then0(function(value) {
        var cb = function() { resolve(value); };
        P.resolve().then(handler).then0(cb, reject);
      }, function(reason) {
        var cb = function() { reject(reason); };
        P.resolve().then(handler).then0(cb, reject);
      });
    });
  };

  // ---------- wrappers and function-writing helpers --------------

  // Transparently handle synchronous exceptions and early returns.
  // This is like `Q.promised`.
  Promise.method = function(fn) {
    var P = this || Promise;
    if (typeof fn !== 'function') {
      throw new TypeError('must wrap a function'); // Fail fast
    }
    return function() {
      var self = this;
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
      }
      return P.resolve(self).then(function(self) {
        return P.all(args).then(function(args) {
          return new P(function(resolve, reject) {
            try {
              resolve(fn.apply(self, args));
            } catch (e) {
              reject(e);
            }
          });
        });
      });
    };
  };

  // Register a node-style callback on this promise.
  Promise.prototype.nodify = function(callback) {
    var promise = this;
    if (callback) {
      var queueThrow = function(e) {
        // Don't let this exception get swallowed by the Promise handlers
        setTimeout(function() { throw e; }, 0);
      };
      promise.then0(function(v) {
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
  Promise.promisify = function(nodeFunction, names, optThis) {
    var P = this || Promise;
    var hasThis = (arguments.length > 2);
    return function(a, b, c) {
      var self = hasThis ? optThis : this;
      var l = arguments.length;
      if (l <= 3 && !names) {
        // This section is a bit redundant, but it improves performance
        // in the common case.
        return new P(function(resolve, reject) {
          var cb = function(e, v) {
            if (e) {
              reject(e);
            } else {
              resolve(v);
            }
          };
          switch (l) {
            case 0: { nodeFunction.call(self, cb); return; }
            case 1: { nodeFunction.call(self, a, cb); return; }
            case 2: { nodeFunction.call(self, a, b, cb); return; }
            case 3: { nodeFunction.call(self, a, b, c, cb); return; }
            default: { throw new Error('unreachable'); }
          }
        });
      }
      var args = new Array(l + 1);
      for (var i = 0; i < l; ++i) {
        args[i] = arguments[i];
      }
      return new P(function(resolve, reject) {
        args[l] = function(e, v) {
          if (e) {
            reject(e);
          } else if (names === true) {
            var a = new Array(arguments.length - 1);
            for (var j = 0; j < a.length; ++j) {
              a[j] = arguments[j + 1];
            }
            resolve(a);
          } else if (names) {
            var value = {};
            for (var index in names) {
              value[names[index]] = arguments[(+index) + 1];
            }
            resolve(value);
          } else {
            resolve(v);
          }
        };
        nodeFunction.apply(self, args);
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
      args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }

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
  Promise.guard.n = function(allowed) {
    var count, waiting;

    count = 0;
    waiting = [];

    var exit = function() {
      if (count > 0) {
        count--;
      }
      if (waiting.length) {
        waiting.shift()(exit);
      }
    };

    return function enter() {
      return new Promise(function(resolve) {
        if (count < allowed) {
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
    // Create a new Promise subclass (this is less cumbersome in es6, sigh)
    var BoundPromise = function BoundPromise(exec) {
      var self = new SuperPromise(exec);
      setPrototypeOf(self, BoundPromise.prototype);
      self._promiseConstructor = BoundPromise;
      return self;
    };
    setPrototypeOf(BoundPromise, SuperPromise);
    BoundPromise.prototype = Object.create(SuperPromise.prototype);
    BoundPromise.prototype.constructor = BoundPromise;
    BoundPromise.prototype._bindSuper = SuperPromise;

    // This re-definition of 'then' is where the actual work happens.
    BoundPromise.prototype.then = (function(superThen) {
      return function(f, r) {
        var ff = f && f.bind(newThis);
        var rr = r && r.bind(newThis);
        return superThen.call(this, ff, rr);
      };
    })(BoundPromise.prototype.then);
    BoundPromise.prototype.then0 = function(f,r) { this.then(f, r); };

    // See discussion of PrFunPromise.resolve above:
    if (makeResolve) {
      BoundPromise.resolve = makeResolve(BoundPromise.resolve);
    }

    return newThis ? BoundPromise.resolve(this) : SuperPromise.resolve(this);
  };

  // Generators.
  Promise.async = function(makeGenerator, cbArg) {
    var P = this || Promise;
    return function() {
      var generator = makeGenerator.apply(this, arguments);
      // Isolate try/catch to standalone functions, since v8
      // will not optimize any method containing a `try` block.
      var errObject = { e: null };
      var tryCatchNext = function(arg) {
        try {
          return generator.next(arg);
        } catch (e) {
          errObject.e = e;
          return errObject;
        }
      };
      var tryCatchThrow = function(arg) {
        try {
          return generator['throw'](arg);
        } catch (e) {
          errObject.e = e;
          return errObject;
        }
      };
      var resultP = new P(function(resolve, reject) {
        var callback, errback;
        var continuer = function(fn, arg) {
          var result = fn(arg);
          if (result === errObject) {
            reject(result.e);
            return;
          }
          if (result.done) {
            resolve(result.value);
            return;
          }
          // Using then0 here yields a significant performance improvement.
          P.resolve(result.value).then0(callback, errback);
        };
        callback = function(arg) { return continuer(tryCatchNext, arg); };
        errback = function(e) { return continuer(tryCatchThrow, e); };
        callback();
      });
      return (cbArg === undefined) ? resultP :
        Promise.prototype.nodify.call(resultP, arguments[cbArg]);
    };
  };

  if (!smash) { cache.set(ParentPromise, Promise); }
  return Promise;
};
