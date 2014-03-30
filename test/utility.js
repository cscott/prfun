"use strict";

var assert = require("assert");
require('../');

function fail(done) {
  return function(e) { done(e); };
}

describe('Promise#call', function() {
  it('should call when given an object', function(done) {
    Promise.resolve({
      test: function() { return Promise.resolve(this.foo); },
      foo: 42
    }).call('test').then(function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should call with arguments when given an object', function(done) {
    Promise.resolve({
      test: function(x, y) { return Promise.resolve(x + 2*y + this.foo); },
      foo: 42
    }).call('test', 3, Promise.resolve(7)).then(function(v) {
      assert.deepEqual(v, 3 + 2*7 + 42);
    }).then(done, fail(done));
  });

  it('should reject when not given an object', function(done) {
    Promise.resolve(null).call('test').then(assert.fail, function(v) {
      assert(v instanceof TypeError);
    }).then(done, fail(done));
  });

  it('should reject when given an object without the named function', function(done) {
    Promise.resolve({}).call('test').then(assert.fail, function(v) {
      assert(v instanceof TypeError);
    }).then(done, fail(done));
  });

  it('should reject when given a rejected promise', function(done) {
    Promise.reject(3).call('test').then(assert.fail, function(v) {
      assert.deepEqual(v, 3);
    }).then(done, fail(done));
  });
});

describe('Promise#get', function() {
  it('should fetch when given an object', function(done) {
    Promise.resolve({
      test: 42
    }).get('test').then(function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should resolve when given an object with a promise', function(done) {
    Promise.resolve({
      test: Promise.resolve(42)
    }).get('test').then(function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should reject when not given an object', function(done) {
    Promise.resolve(null).get('test').then(assert.fail, function(v) {
      assert(v instanceof TypeError);
    }).then(done, fail(done));
  });

  it('should reject when given a rejected promise', function(done) {
    Promise.reject(3).get('test').then(assert.fail, function(v) {
      assert.deepEqual(v, 3);
    }).then(done, fail(done));
  });
});

describe('Promise#return', function() {
  it('should return an immediate value', function(done) {
    Promise.resolve(7)['return'](42).then(function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should return a promise', function(done) {
    Promise.resolve(7)['return'](Promise.resolve(42)).then(function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should reject if promise rejects', function(done) {
    Promise.reject(7)['return'](42).then(assert.fail, function(v) {
      assert.deepEqual(v, 7);
    }).then(done, fail(done));
  });

  it('should reject if returning a rejected promise', function(done) {
    Promise.resolve(7)['return'](Promise.reject(42)).then(assert.fail, function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });
});

describe('Promise#throw', function() {
  it('should throw an immediate value', function(done) {
    Promise.resolve(7)['throw'](42).then(assert.fail, function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should throw a promise', function(done) {
    Promise.resolve(7)['throw'](Promise.resolve(42)).then(assert.fail, function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });

  it('should reject if promise rejects', function(done) {
    Promise.reject(7)['throw'](42).then(assert.fail, function(v) {
      assert.deepEqual(v, 7);
    }).then(done, fail(done));
  });

  it('should reject if throwing a rejected promise', function(done) {
    Promise.resolve(7)['throw'](Promise.reject(42)).then(assert.fail, function(v) {
      assert.deepEqual(v, 42);
    }).then(done, fail(done));
  });
});
