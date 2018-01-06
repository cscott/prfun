/* eslint-disable max-len */
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
var rejected = Promise.reject.bind(Promise);

describe('when.all-test', function() {

  specify('should resolve empty input', function() {
    return when.all([]).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    );
  });

  specify('should resolve promise of empty input', function() {
    return resolved([]).all().then(
      function(result) {
        assert.deepEqual(result, []);
      }
    );
  });

  specify('should resolve values array', function() {
    var input = [1, 2, 3];
    return when.all(input).then(
      function(results) {
        assert.deepEqual(results, input);
      }
    );
  });

  specify('should resolve promise of values array', function() {
    var input = [1, 2, 3];
    return resolved(input).all().then(
      function(results) {
        assert.deepEqual(results, input);
      }
    );
  });

  specify('should resolve promises array', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.all(input).then(
      function(results) {
        assert.deepEqual(results, [1, 2, 3]);
      }
    );
  });

  specify('should resolve promise of promises array', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return resolved(input).all().then(
      function(results) {
        assert.deepEqual(results, [1, 2, 3]);
      }
    );
  });

  specify('should resolve sparse array input', function() {
    /* jshint elision: true */
    var input = [, 1, , 1, 1];
    return when.all(input).then(
      function(results) {
        assert.deepEqual(JSON.stringify(results), JSON.stringify(input));
      }
    );
  });

  specify('should resolve promise of sparse array input', function() {
    /* jshint elision: true */
    var input = [, 1, , 1, 1];
    return resolved(input).all().then(
      function(results) {
        assert.deepEqual(JSON.stringify(results), JSON.stringify(input));
      }
    );
  });

  specify('should reject if any input promise rejects', function() {
    var input = [resolved(1), rejected(2), resolved(3)];
    return when.all(input).then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed, 2);
      }
    );
  });

  specify('should reject if any input promise rejects (2)', function() {
    var input = [resolved(1), rejected(2), resolved(3)];
    return resolved(input).all().then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed, 2);
      }
    );
  });

  specify('should reject if any input promise rejects (3)', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return rejected(input).all().then(
      function() { throw new Error('should not reach here'); },
      function(failed) {
        assert.deepEqual(failed.length, 3);
      }
    );
  });

  specify('should accept a promise for an array', function() {
    var expected, input;

    expected = [1, 2, 3];
    input = resolved(expected);

    return input.all().then(
      function(results) {
        assert.deepEqual(results, expected);
      }
    );
  });

  specify('should reject when input promise does not resolve to array', function() {
    var caught = false;
    return when.all(resolved(1)).caught(TypeError, function(e) { // eslint-disable-line no-unused-vars
      caught = true;
    }).then(function() {
      assert.deepEqual(caught, true);
    });
  });

});
