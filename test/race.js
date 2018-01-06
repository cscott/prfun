/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var Promise = require('../');

var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = Promise.defer.bind(Promise);

describe('Promise.race', function() {

  it('remains forever pending when passed an empty array', function(done) {
    var p = Promise.race([]);
    var pending = true;
    var cb = function() {
      pending = false;
      done(new Error('should not reach here'));
    };

    p.then(cb, cb).done();

    setTimeout(function() {
      assert(pending);
      done();
    }, 100);
  });

  it('remains forever pending when passed a promise of an empty array', function(done) {
    var p = fulfilled([]).race();
    var pending = true;
    var cb = function() {
      pending = false;
      done(new Error('should not reach here'));
    };

    p.then(cb, cb).done();

    setTimeout(function() {
      assert(pending);
      done();
    }, 100);
  });

  it('fulfills when passed an immediate value', function() {
    return Promise.race([1, 2, 3]).then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('fulfills when passed a promise of an immediate value', function() {
    return fulfilled([1, 2, 3]).race().then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('fulfills when passed an immediately fulfilled value', function() {
    var d1 = pending();
    d1.resolve(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.resolve(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.resolve(3);
    var p3 = d3.promise;

    return Promise.race([p1, p2, p3]).then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('fulfills when passed a promise of an immediately fulfilled value', function() {
    var d1 = pending();
    d1.resolve(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.resolve(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.resolve(3);
    var p3 = d3.promise;

    return fulfilled([p1, p2, p3]).race().then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('fulfills when passed an eventually fulfilled value', function() {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    setTimeout(function() {
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);

    return Promise.race([p1, p2, p3]).then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('fulfills when passed a promise of an eventually fulfilled value', function() {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    setTimeout(function() {
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);

    return fulfilled([p1, p2, p3]).race().then(function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed an immediate value', function() {
    return Promise.race([rejected(1), 2, 3]).then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed a promise of an immediate value', function() {
    return fulfilled([rejected(1), 2, 3]).race().then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed an immediately rejected value', function() {
    var d1 = pending();
    d1.reject(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.resolve(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.resolve(3);
    var p3 = d3.promise;

    /* jshint elision: true */
    return Promise.race([p1, p2, , ,  p3]).then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed a promise of an immediately rejected value', function() {
    var d1 = pending();
    d1.reject(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.resolve(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.resolve(3);
    var p3 = d3.promise;

    /* jshint elision: true */
    return fulfilled([p1, p2, , ,  p3]).race().then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed an eventually rejected value', function() {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    setTimeout(function() {
      d1.reject(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);

    return Promise.race([p1, p2, p3]).then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed a promise of an eventually rejected value', function() {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    setTimeout(function() {
      d1.reject(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);

    return fulfilled([p1, p2, p3]).race().then(assert.fail, function(v) {
      assert.deepEqual(v, 1);
    });
  });

  it('rejects when passed a rejected promise', function() {
    return rejected([]).race().then(assert.fail, function(v) {
      assert.deepEqual(v, []);
    });
  });
});
