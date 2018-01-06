'use strict';

var assert = require('assert');
var Promise = require('../');

var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = Promise.defer.bind(Promise);

describe('Promise.props', function() {

  specify('should reject undefined', function() {
    return Promise.props().then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    });
  });

  specify('should reject primitive', function() {
    return Promise.props('str').then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    });
  });

  specify('should resolve to new object', function() {
    var o = {};
    return Promise.props(o).then(function(v) {
      assert(v !== o);
      assert.deepEqual(o, v);
    });
  });

  specify('should resolve value properties', function() {
    var o = {
      one: 1,
      two: 2,
      three: 3,
    };
    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  specify('should resolve immediate properties', function() {
    var o = {
      one: fulfilled(1),
      two: fulfilled(2),
      three: fulfilled(3),
    };
    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  specify('should resolve eventual properties', function() {
    var d1 = pending();
    var d2 = pending();
    var d3 = pending();
    var o = {
      one: d1.promise,
      two: d2.promise,
      three: d3.promise,
    };
    setTimeout(function() {
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);
    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  specify('should reject if any input promise rejects', function() {
    var o = {
      one: fulfilled(1),
      two: rejected(2),
      three: fulfilled(3),
    };
    return Promise.props(o).then(assert.fail, function(v) {
      assert(v === 2);
    });
  });

  specify('should accept a promise for an object', function() {
    var o = {
      one: fulfilled(1),
      two: fulfilled(2),
      three: fulfilled(3),
    };
    var d1 = pending();
    setTimeout(function() {
      d1.resolve(o);
    }, 13);
    return Promise.props(d1.promise).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  specify('should reject a promise for a primitive', function() {
    var d1 = pending();
    setTimeout(function() {
      d1.resolve('text');
    }, 13);
    return Promise.props(d1.promise).then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    });
  });

  specify('should accept thenables in properties', function() {
    var t1 = { then: function(cb) {cb(1);} };
    var t2 = { then: function(cb) {cb(2);} };
    var t3 = { then: function(cb) {cb(3);} };
    var o = {
      one: t1,
      two: t2,
      three: t3,
    };
    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  specify('should accept a thenable for thenables in properties', function() {
    var o = {
      then: function(f) {
        f({
          one: {
            then: function(cb) {
              cb(1);
            },
          },
          two: {
            then: function(cb) {
              cb(2);
            },
          },
          three: {
            then: function(cb) {
              cb(3);
            },
          },
        });
      },
    };
    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3,
      }, v);
    });
  });

  // jscs: disable requireCapitalizedComments
  /*
    specify('sends { key, value } progress updates', function(done) {
    var deferred1 = Q.defer();
    var deferred2 = Q.defer();

    var progressValues = [];

    Q.delay(50).then(function () {
    deferred1.notify('a');
    });
    Q.delay(100).then(function () {
    deferred2.notify('b');
    deferred2.resolve();
    });
    Q.delay(150).then(function () {
    deferred1.notify('c');
    deferred1.resolve();
    });

    Promise.props({
    one: deferred1.promise,
    two: deferred2.promise
    }).then(function () {
    assert.deepEqual(progressValues, [
    { key: 'one', value: 'a' },
    { key: 'two', value: 'b' },
    { key: 'one', value: 'c' }
    ]);
    done();
    },
    undefined,
    function (progressValue) {
    progressValues.push(progressValue);
    });
    });
  */
  // jscs: enable requireCapitalizedComments

  specify('treats arrays for their properties', function() {
    var o = [1, 2, 3];

    return Promise.props(o).then(function(v) {
      assert.deepEqual({
        0: 1,
        1: 2,
        2: 3,
      }, v);
    });
  });

});
