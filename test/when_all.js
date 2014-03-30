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

describe("when.all-test", function () {

  specify("should resolve empty input", function(done) {
    return when.all([]).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    ).then(done, fail(done));
  });

  specify("should resolve promise of empty input", function(done) {
    return resolved([]).all().then(
      function(result) {
        assert.deepEqual(result, []);
      }
    ).then(done, fail(done));
  });

  specify("should resolve values array", function(done) {
    var input = [1, 2, 3];
    when.all(input).then(
      function(results) {
        assert.deepEqual(results, input);
      }
    ).then(done, fail(done));
  });

  specify("should resolve promise of values array", function(done) {
    var input = [1, 2, 3];
    resolved(input).all().then(
      function(results) {
        assert.deepEqual(results, input);
      }
    ).then(done, fail(done));
  });

  specify("should resolve promises array", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.all(input).then(
      function(results) {
        assert.deepEqual(results, [1, 2, 3]);
      }
    ).then(done, fail(done));
  });

  specify("should resolve promise of promises array", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    resolved(input).all().then(
      function(results) {
        assert.deepEqual(results, [1, 2, 3]);
      }
    ).then(done, fail(done));
  });

  specify("should resolve sparse array input", function(done) {
    var input = [, 1, , 1, 1 ];
    when.all(input).then(
      function(results) {
        assert.deepEqual(JSON.stringify(results), JSON.stringify(input));
      }
    ).then(done, fail(done));
  });

  specify("should resolve promise of sparse array input", function(done) {
    var input = [, 1, , 1, 1 ];
    resolved(input).all().then(
      function(results) {
        assert.deepEqual(JSON.stringify(results), JSON.stringify(input));
      }
    ).then(done, fail(done));
  });

  specify("should reject if any input promise rejects", function(done) {
    var input = [resolved(1), rejected(2), resolved(3)];
    when.all(input).then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed, 2);
      }
    ).then(done, fail(done));
  });

  specify("should reject if any input promise rejects (2)", function(done) {
    var input = [resolved(1), rejected(2), resolved(3)];
    resolved(input).all().then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed, 2);
      }
    ).then(done, fail(done));
  });

  specify("should reject if any input promise rejects (3)", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    rejected(input).all().then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed.length, 3);
      }
    ).then(done, fail(done));
  });

  specify("should accept a promise for an array", function(done) {
    var expected, input;

    expected = [1, 2, 3];
    input = resolved(expected);

    input.all().then(
      function(results) {
        assert.deepEqual(results, expected);
      }
    ).then(done, fail(done));
  });

  specify("should reject when input promise does not resolve to array", function(done) {
    when.all(resolved(1)).caught(TypeError, function(e){
      done();
    });
  });

});
