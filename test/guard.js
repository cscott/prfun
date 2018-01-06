/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var Promise = require('../');

var sentinel = {};
var other = {};

function noop() {}

var mkspy = function(calls) {
  return function spy() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    calls.push(args);
  };
};

describe('Promise.guard', function() {

  it('should return a function', function() {
    assert.equal(typeof Promise.guard(), 'function');
    // Return a promise from all synchronous tests, for consistency
    return Promise.resolve();
  });

  it('should invoke condition', function() {
    var condition;
    var guarded;
    var called = 0;

    condition = function() { called++; };

    guarded = Promise.guard(condition, noop);

    guarded();

    assert.equal(called, 1);

    // Return a promise from all synchronous tests, for consistency
    return Promise.resolve();
  });

  it('should invoke guarded function after condition promise fulfills', function() {
    var condition, f, guarded;
    var calls = [];

    condition = function() { return noop; };
    f = mkspy(calls);
    guarded = Promise.guard(condition, f);

    return guarded.call(null, sentinel).then(function() {
      assert.deepEqual(calls, [[null, sentinel]]);
    });
  });

  it('should notify condition once guarded function settles', function() {
    var condition, notify, guarded;
    var calls = [];

    notify = mkspy(calls);
    condition = function() { return notify; };
    guarded = Promise.guard(condition, noop);

    return guarded().then(function() {
      assert.equal(calls.length, 1);
    });
  });

  it('should initiate next guarded call after notify', function() {
    var condition, f, guarded;
    var calls = [];

    f = mkspy(calls);
    condition = function() { return noop; };
    guarded = Promise.guard(condition, f);

    return guarded(other).then(function() {
      assert.equal(calls.length, 1);
      return guarded(sentinel).then(function() {
        assert.equal(calls.length, 2);
        assert.deepEqual(calls[1], [undefined, sentinel]);
      });
    });
  });

  describe('n', function() {
    it('should create a function', function() {
      assert.equal(typeof Promise.guard.n(1), 'function');
      // Return a promise from all synchronous tests, for consistency
      return Promise.resolve();
    });

    it('should return a promise', function() {
      var c = Promise.guard.n(1);
      assert.equal(typeof c().then, 'function');
      // Return a promise from all synchronous tests, for consistency
      return Promise.resolve();
    });

    it('returned promise should resolve to a function', function() {
      var enter = Promise.guard.n(1);
      return enter().then(function(exit) {
        assert.equal(typeof exit, 'function');
      });
    });

    it('should allow one execution', function() {
      var enter, value, first, second;

      enter = Promise.guard.n(1);
      value = sentinel;

      first = enter();
      second = enter();

      var p1 = first.then(function(exit) {
        return Promise.delay(50).then(function() {
          assert.strictEqual(value, sentinel);
          exit();
        });
      });

      var p2 = second.then(function() {
        value = other;
      });

      return Promise.join(p1, p2);
    });

    it('should allow two executions', function() {
      var one, value, first, second, third;

      one = Promise.guard.n(2);
      value = sentinel;

      first = one();
      second = one();
      third = one();

      var p1 = first.then(function() {
        assert.strictEqual(value, sentinel);
      });

      var p2 = second.then(function(exit) {
        return Promise.delay(50).then(function() {
          assert.strictEqual(value, sentinel);
          exit();
        });
      });

      var p3 = third.then(function() { value = other; });

      return Promise.join(p1, p2, p3);
    });
  });
});
