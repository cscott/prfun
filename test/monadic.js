"use strict";

var assert = require("assert");
require('../')();

function fail(done) {
  return function(e) { done(e); };
}

describe('Promise.Monadic', function() {
  it('immediate values are resolved', function(done) {
    Promise.Monadic.resolve(5).chain(function(v) {
      assert.equal(v, 5);
    }).then(done, fail(done));
  });
  it("alternate test case", function(done) {
    var resolve;
    new Promise.Monadic(function(r) { resolve = r; }).chain(function(x) {
      assert.notEqual(x, 5);
      return Promise.Monadic.resolve(x); // wrap it again
    }).chain(function(x) {
      assert.notEqual(x, 5);
      return x;
    }).chain(function(x) {
      assert.equal(x, 5);
    }).then(done, fail(done));
    resolve(Promise.Monadic.resolve(5));
  });
  it("wrapped promises aren't prematurely unwrapped", function(done) {
    Promise.Monadic.resolve(
      Promise.Monadic.resolve(
        Promise.Monadic.resolve(5)
      )).chain(function(v) {
        assert.notEqual(v, 5);
        return v;
      }).chain(function(v) {
        assert.notEqual(v, 5);
        return v;
      }).chain(function(v) {
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
});
