"use strict";
/*
  Based on When.js tests

  Open Source Initiative OSI - The MIT License

  http://www.opensource.org/licenses/mit-license.php

  Copyright (c) 2011 Brian Cavalier

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");
require('../');

var when = Promise;
var resolved = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);

function fail(done) {
  return function(e) { done(e); };
}

var sentinel = {};
var other = {};

var refute = {
  defined: function(val) {
    assert( typeof val === "undefined" );
  },

  equals: function( a, b ) {
    assert.notDeepEqual( a, b );
  }
};

function fakeResolved(val) {
  return {
    then: function(callback) {
      return fakeResolved(callback ? callback(val) : val);
    }
  };
}

function fakeRejected(reason) {
  return {
    then: function(callback, errback) {
      return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
    }
  };
}

describe("Promise.defer", function () {


  specify("should fulfill with an immediate value", function(done) {
    var d = when.defer();

    d.promise.then(
      function(val) {
        assert.equal(val, sentinel);
      }
    ).then(done, fail(done));

    d.resolve(sentinel);
  });

  specify("should fulfill with fulfilled promised", function(done) {
    var d = when.defer();

    d.promise.then(
      function(val) {
        assert.equal(val, sentinel);
      }
    ).then(done, fail(done));

    d.resolve(fakeResolved(sentinel));
  });

  specify("should reject with rejected promise", function(done) {
    var d = when.defer();

    d.promise.then(
      assert.fail,
      function(val) {
        assert.equal(val, sentinel);
      }
    ).then(done, fail(done));

    d.resolve(fakeRejected(sentinel));
  });

  specify("should return a promise for the resolution value", function(done) {
    var d = when.defer();

    d.resolve(sentinel);
    d.promise.then(
      function(returnedPromiseVal) {
        assert.deepEqual(returnedPromiseVal, sentinel);
      }
    ).then(done, fail(done));
  });

  specify("should return a promise for a promised resolution value", function(done) {
    var d = when.defer();

    d.resolve(when.resolve(sentinel));
    d.promise.then(
      function(returnedPromiseVal) {
        assert.deepEqual(returnedPromiseVal, sentinel);
      }
    ).then(done, fail(done));
  });

  specify("should return a promise for a promised rejection value", function(done) {
    var d = when.defer();

    // Both the returned promise, and the deferred's own promise should
    // be rejected with the same value
    d.resolve(when.reject(sentinel));
    d.promise.then(
      assert.fail,
      function(returnedPromiseVal) {
        assert.deepEqual(returnedPromiseVal, sentinel);
      }
    ).then(done, fail(done));
  });

  specify("should invoke newly added callback when already resolved", function(done) {
    var d = when.defer();

    d.resolve(sentinel);

    d.promise.then(
      function(val) {
        assert.equal(val, sentinel);
      }
    ).then(done, fail(done));
  });



  specify("should reject with an immediate value", function(done) {
    var d = when.defer();

    d.promise.then(
      assert.fail,
      function(val) {
        assert.equal(val, sentinel);
      }
    ).then(done, fail(done));

    d.reject(sentinel);
  });

  specify("should reject with fulfilled promised", function(done) {
    var d, expected;

    d = when.defer();
    expected = fakeResolved(sentinel);

    d.promise.then(
      assert.fail,
      function(val) {
        assert.equal(val, expected);
      }
    ).then(done, fail(done));

    d.reject(expected);
  });

  specify("should reject with rejected promise", function(done) {
    var d, expected;

    d = when.defer();
    expected = fakeRejected(sentinel);

    d.promise.then(
      assert.fail,
      function(val) {
        assert.equal(val, expected);
      }
    ).then(done, fail(done));

    d.reject(expected);
  });


  specify("should return a promise for the rejection value", function(done) {
    var d = when.defer();

    // Both the returned promise, and the deferred's own promise should
    // be rejected with the same value
    d.reject(sentinel);
    d.promise.then(
      assert.fail,
      function(returnedPromiseVal) {
        assert.deepEqual(returnedPromiseVal, sentinel);
      }
    ).then(done, fail(done));
  });

  specify("should invoke newly added errback when already rejected", function(done) {
    var d = when.defer();

    d.reject(sentinel);

    d.promise.then(
      assert.fail,
      function (val) {
        assert.deepEqual(val, sentinel);
      }
    ).then(done, fail(done));
  });
});
