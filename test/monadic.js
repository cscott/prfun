"use strict";

var assert = require("assert");
require('../')();

function fail(done) {
  return function(e) { done(e); };
}

describe('Promise.Monadic', function() {
  it('immediate values are resolved', function(done) {
    Promise.Monadic.resolve(5).then(function(v) {
      assert.equal(v, 5);
    }).then(done, fail(done));
  });
  it("wrapped promises aren't prematurely unwrapped", function(done) {
    Promise.Monadic.resolve(
      Promise.Monadic.resolve(
        Promise.Monadic.resolve(5)
      )).then(function(v) {
        assert(v !== 5);
        return v;
      }).then(function(v) {
        assert(v !== 5);
        return v;
      }).then(function(v) {
        assert.equal(v, 5);
      }).then(done, fail(done));
  });

  describe("Promise.all", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.all([
        1,
        Promise.Monadic.resolve(2),
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).then(function(a) {
        assert.equal(a.length, 3);
        assert.equal(a[0], 1);
        assert.equal(a[1], 2);
        assert.notEqual(a[2], 3);
        return a[2];
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise#all", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.resolve([
        1,
        Promise.Monadic.resolve(2),
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).all().then(function(a) {
        assert.equal(a.length, 3);
        assert.equal(a[0], 1);
        assert.equal(a[1], 2);
        assert.notEqual(a[2], 3);
        return a[2];
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise.map", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.map([
        1,
        Promise.Monadic.resolve(2),
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ], function(x) { return x; }).then(function(a) {
        assert.equal(a.length, 3);
        assert.equal(a[0], 1);
        assert.equal(a[1], 2);
        assert.notEqual(a[2], 3);
        return a[2];
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise#map", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.resolve([
        1,
        Promise.Monadic.resolve(2),
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).map(function(x) { return x; }).then(function(a) {
        assert.equal(a.length, 3);
        assert.equal(a[0], 1);
        assert.equal(a[1], 2);
        assert.notEqual(a[2], 3);
        return a[2];
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise.props", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.props({
        f1: 1,
        f2: Promise.Monadic.resolve(2),
        f3: Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      }).then(function(a) {
        assert.equal(a.f1, 1);
        assert.equal(a.f2, 2);
        assert.notEqual(a.f3, 3);
        return a.f3;
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise#props", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.resolve({
        f1: 1,
        f2: Promise.Monadic.resolve(2),
        f3: Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      }).props().then(function(a) {
        assert.equal(a.f1, 1);
        assert.equal(a.f2, 2);
        assert.notEqual(a.f3, 3);
        return a.f3;
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise.race", function() {
    it('should unwrap elements one time (1)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.race([
        never,
        1
      ]).then(function(a) {
        assert.equal(a, 1);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.race([
        never,
        Promise.Monadic.resolve(2),
      ]).then(function(a) {
        assert.equal(a, 2);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (3)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.race([
        never,
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).then(function(a) {
        assert.notEqual(a, 3);
        return a;
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise#race", function() {
    it('should unwrap elements one time (1)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.resolve([
        never,
        1
      ]).race().then(function(a) {
        assert.equal(a, 1);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.resolve([
        never,
        Promise.Monadic.resolve(2),
      ]).race().then(function(a) {
        assert.equal(a, 2);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (3)', function(done) {
      var never = new Promise(function(){});
      Promise.Monadic.resolve([
        never,
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).race().then(function(a) {
        assert.notEqual(a, 3);
        return a;
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  // XXX test reduce
  // XXX test reduceRight

  describe("Promise#spread", function() {
    it('should unwrap elements one time', function(done) {
      Promise.Monadic.resolve([
        1,
        Promise.Monadic.resolve(2),
        Promise.Monadic.resolve(Promise.Monadic.resolve(3))
      ]).spread(function(a, b, c) {
        assert.equal(a, 1);
        assert.equal(b, 2);
        assert.notEqual(c, 3);
        return c;
      }).then(function(v) {
        assert.equal(v, 3);
      }).then(done, fail(done));
    });
  });

  describe("Promise#call", function() {
    it('should unwrap elements one time (1)', function(done) {
      Promise.Monadic.resolve({
        foo: function(v) { return v; }
      }).call('foo', 42).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      var o = Promise.Monadic.resolve({ foo: function() { return 88; }});
      o.foo = function() { return 42; };
      Promise.Monadic.resolve(o).call('foo').then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (3)', function(done) {
      Promise.Monadic.resolve({
        foo: function(v) { return v; }
      }).call('foo', Promise.Monadic.resolve(42)).then(function(a) {
        assert.notEqual(a, 42);
        return a;
      }).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
  });

  describe("Promise#get", function() {
    it('should unwrap elements one time (1)', function(done) {
      Promise.Monadic.resolve({
        foo: 42
      }).get('foo').then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      var o = Promise.Monadic.resolve({ foo: 88 });
      o.foo = 42;
      Promise.Monadic.resolve(o).get('foo').then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (3)', function(done) {
      Promise.Monadic.resolve({
        foo: Promise.Monadic.resolve(42)
      }).get('foo').then(function(a) {
        assert.notEqual(a, 42);
        return a;
      }).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
  });

  describe("Promise#return", function() {
    it('should unwrap elements one time (1)', function(done) {
      Promise.Monadic.resolve(77).return(42).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      Promise.Monadic.resolve(77).return(
        Promise.Monadic.resolve(42)
      ).then(function(a) {
        assert.notEqual(a, 42);
        return a;
      }).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
  });

  describe("Promise#delay", function() {
    it('should unwrap elements one time (1)', function(done) {
      Promise.Monadic.resolve(42).delay(5).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      Promise.Monadic.resolve(
        Promise.Monadic.resolve(42)
      ).delay(5).then(function(a) {
        assert.notEqual(a, 42);
        return a;
      }).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
  });

  describe("Promise#timeout", function() {
    it('should unwrap elements one time (1)', function(done) {
      Promise.Monadic.resolve(42).timeout(1000).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
    it('should unwrap elements one time (2)', function(done) {
      Promise.Monadic.resolve(
        Promise.Monadic.resolve(42)
      ).timeout(1000).then(function(a) {
        assert.notEqual(a, 42);
        return a;
      }).then(function(a) {
        assert.equal(a, 42);
      }).then(done, fail(done));
    });
  });
});
