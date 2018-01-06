'use strict';

var assert = require('assert');
var Promise = require('../');

var fulfilled = Promise.resolve.bind(Promise);
var pending = Promise.defer.bind(Promise);

var obj = {};
var error = new Error();

describe('Promise.method', function() {

  var thrower = Promise.method(function() {
    throw error;
  });

  var identity = Promise.method(function(val) {
    return val;
  });

  var array = Promise.method(function() {
    return [].slice.call(arguments);
  });

  var receiver = Promise.method(function() {
    return this;
  });

  specify('should reject when the function throws', function() {
    var async = false;
    var p = thrower().then(assert.fail, function(e) {
      assert(async);
      assert(e === error);
    });
    async = true;
    return p;
  });

  specify('should throw when the function is not a function', function() {
    try {
      Promise.method(null);
      assert.fail();
    } catch (e) {
      assert(e instanceof TypeError);
    }
    // Return a promise from all synchronous tests, for consistency
    return Promise.resolve();
  });

  specify('should call the function with the given receiver', function() {
    var async = false;
    var p = receiver.call(obj).then(function(val) {
      assert(async);
      assert(val === obj);
    });
    async = true;
    return p;
  });

  specify('should call the function with the given value', function() {
    var async = false;
    var p = identity(obj).then(function(val) {
      assert(async);
      assert(val === obj);
    });
    async = true;
    return p;
  });

  specify('should apply the function if given value is array', function() {
    var async = false;
    var p = array(1, 2, 3).then(function(val) {
      assert(async);
      assert.deepEqual(val, [1, 2, 3]);
    });
    async = true;
    return p;
  });

  specify('should unwrap returned promise', function() {
    var d = pending();

    var p = Promise.method(function() {
      return d.promise;
    })().then(function(v) {
      assert.deepEqual(v, 3);
    });

    setTimeout(function() {
      d.resolve(3);
    }, 13);
    return p;
  });

  specify('should unwrap returned thenable', function() {
    return Promise.method(function() {
      return {
        then: function(f, v) { // eslint-disable-line no-unused-vars
          f(3);
        },
      };
    })().then(function(v) {
      assert.deepEqual(v, 3);
    });
  });

  specify('should unwrap this and arguments', function() {
    var THIS = {};
    var pThis = pending();
    var f = Promise.method(function(v) {
      assert(this === THIS);
      assert(v === 42);
    });
    var p = f.call(pThis.promise, fulfilled(42));
    setTimeout(function() {
      pThis.resolve(THIS);
    }, 10);
    return p;
  });
});
