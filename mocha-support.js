// Extra support for mocha.
//
// The new "return a Promise" support in mocha is very nice, but it opens
// up a new way to screw up your tests: since it uses the synchronous
// test style, if you intend to return a Promise but forget to, the Promise
// will be orphaned and the test will complete regardless of whether the
// Promise had been rejected or not.  Whoops: now your test is effectively
// being silently skipped.
//
// Since the vast majority of our "synchronous" tests in this package actually
// involve Promises, do a little bit of magic redefinition of the `it` and
// `specify` functions to assert that they *always* return a `Promise`.
// This ensures we can't accidentally write no-op tests.

var assert = require('assert');
// Always use core-js promises for tests, since platform Promises may
// not properly implement ES6 subclasses.
delete global.Promise;
// Loading promises as a library was broken in core-js 0.9.0; it was fixed
// by zloirock/core-js@bba6d8d included in 0.9.1.  Previously we needed to
// load all of core-js here to work around the issue.
// require('core-js');

// Wrap specify/it and ensure that they always return a promise if synchronous.
var onlypromises = function(f) {
  return function(title, cb) {
    var cb2;
    if (cb.length === 1) {
      cb2 = function(done) {
        assert(arguments.length === 1);
        var result = cb(done);
        assert.ok(!result,
                  'Tests with callbacks should not return a value: ' + title);
      };
    } else if (cb.length === 0) {
      cb2 = function() {
        assert(arguments.length === 0);
        var result = cb();
        assert.ok(result && typeof result.then === 'function',
                  'Synchronous tests should return a promise: ' + title);
        return result;
      };
    } else {
      assert(false);
    }
    return f(title, cb2);
  };
};

// This module actually is loaded before mocha defines the specify/it
// functions, so define a getter/setter on global that will intercept
// the future definitions of specify/it and wrap them.
var realSpecify = onlypromises(global.specify);
Object.defineProperty(global, 'specify', {
  get: function() { return realSpecify; },
  set: function(v) { realSpecify = onlypromises(v); },
});

var realIt = onlypromises(global.it);
Object.defineProperty(global, 'it', {
  get: function() { return realIt; },
  set: function(v) { realIt = onlypromises(v); },
});
