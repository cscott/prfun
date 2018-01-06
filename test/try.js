'use strict';

var assert = require('assert');
var Promise = require('../');

var fulfilled = Promise.resolve.bind(Promise);
var pending = Promise.defer.bind(Promise);

var obj = {};
var error = new Error();
var thrower = function() {
  throw error;
};

var identity = function(val) {
  return val;
};

var array = function() {
  return [].slice.call(arguments);
};

var receiver = function() {
  return this;
};

var tryy = Promise['try'].bind(Promise);

describe('Promise.try', function() {
  specify('should reject when the function throws', function() {
    var async = false;
    var p = tryy(thrower).then(assert.fail, function(e) {
      assert(async);
      assert(e === error);
    });
    async = true;
    return p;
  });
  specify('should reject when the function is not a function', function() {
    var async = false;
    var p = tryy(null).then(assert.fail, function(e) {
      assert(async);
      assert(e instanceof TypeError);
    });
    async = true;
    return p;
  });
  specify('should call the function with the given receiver', function() {
    var async = false;
    var p = tryy(receiver, obj).then(function(val) {
      assert(async);
      assert(val === obj);
    });
    async = true;
    return p;
  });
  specify('should call the function with the given value', function() {
    var async = false;
    var p = tryy(identity, null, obj).then(function(val) {
      assert(async);
      assert(val === obj);
    });
    async = true;
    return p;
  });
  specify('should call the function with the given values', function() {
    var async = false;
    var p = tryy(array, null, 1, 2, 3).then(function(val) {
      assert(async);
      assert.deepEqual(val, [1, 2, 3]);
    });
    async = true;
    return p;
  });

  specify('should unwrap this and arguments', function() {
    var d = pending();
    var THIS = {};
    var p = tryy(function(v) {
      assert(this === THIS);
      assert(v === 42);
    }, d.promise, fulfilled(42)
    );

    setTimeout(function() {
      d.resolve(THIS);
    }, 10);

    return p;
  });

  specify('should unwrap returned promise', function() {
    var d = pending();

    var p = tryy(function() {
      return d.promise;
    }).then(function(v) {
      assert(v === 3);
    });

    setTimeout(function() {
      d.resolve(3);
    }, 13);

    return p;
  });
  specify('should unwrap returned thenable', function() {

    return tryy(function() {
      return {
        then: function(f, v) { // eslint-disable-line no-unused-vars
          f(3);
        },
      };
    }).then(function(v) {
      assert(v === 3);
    });
  });
});
