'use strict';
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
var assert = require('assert');
var Promise = require('../');

var when = Promise;
var resolved = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise); // eslint-disable-line

describe('when.spread-test', function() {
  var slice = [].slice;

  specify('should return a promise', function() {
    assert(typeof (resolved([1, 2]).spread().then) === 'function');
    // Return a promise from all synchronous tests, for consistency
    return resolved();
  });

  specify('should apply onFulfilled with array as argument list', function() {
    var expected = [1, 2, 3];
    return when.resolve(expected).spread(function() {
      assert.deepEqual(slice.call(arguments), expected);
    });
  });

  specify('should resolve array contents', function() {
    var expected = [when.resolve(1), 2, when.resolve(3)];
    return when.resolve(expected).spread(function() {
      assert.deepEqual(slice.call(arguments), [1, 2, 3]);
    });
  });

  specify('should reject if any item in array rejects (1)', function() {
    var expected = [when.resolve(1), 2, when.reject(3)];
    return when.resolve(expected)
      .spread(assert.fail).then(assert.fail, function(result) {
        assert.deepEqual(result, 3);
      });
  });

  specify('should reject if any item in array rejects (2)', function() {
    var expected = [when.resolve(1), 2, when.resolve(3)];
    return when.reject(expected)
      .spread(assert.fail).then(assert.fail, function(result) {
        assert.deepEqual(result.length, 3);
      });
  });

  specify('should apply onFulfilled with array as argument list', function() {
    var expected = [1, 2, 3];
    return when.resolve(when.resolve(expected)).spread(function() {
      assert.deepEqual(slice.call(arguments), expected);
    });
  });

  specify('should resolve array contents', function() {
    var expected = [when.resolve(1), 2, when.resolve(3)];
    return when.resolve(when.resolve(expected)).spread(function() {
      assert.deepEqual(slice.call(arguments), [1, 2, 3]);
    });
  });

  specify('should resolve array contents in rejection', function() {
    var expected = [when.resolve(1), 2, when.resolve(3)];
    return when.reject(expected).spread(assert.fail, function() {
      assert.deepEqual(slice.call(arguments), [1, 2, 3]);
    });
  });

});
