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

});
