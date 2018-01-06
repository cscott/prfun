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
var reject = Promise.reject.bind(Promise);

var delay = Promise.delay.bind(Promise);

describe('when.map-test', function() {

  function mapper(val) {
    return val * 2;
  }

  function deferredMapper(val) {
    return delay(mapper(val), Math.random() * 10);
  }

  specify('should map input values array', function() {
    var input = [1, 2, 3];
    return when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2, 4, 6]);
      }
    );
  });

  specify('should map input promises array', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2, 4, 6]);
      }
    );
  });

  specify('should map mixed input array', function() {
    var input = [1, resolved(2), 3];
    return when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2, 4, 6]);
      }
    );
  });

  specify('should map input when mapper returns a promise', function() {
    var input = [1, 2, 3];
    return when.map(input, deferredMapper).then(
      function(results) {
        assert.deepEqual(results, [2, 4, 6]);
      }
    );
  });

  specify('should accept a promise for an array (1)', function() {
    return when.map(resolved([1, resolved(2), 3]), mapper).then(
      function(result) {
        assert.deepEqual(result, [2, 4, 6]);
      }
    );
  });

  specify('should accept a promise for an array (2)', function() {
    return resolved([1, resolved(2), 3]).map(mapper).then(
      function(result) {
        assert.deepEqual(result, [2, 4, 6]);
      }
    );
  });

  specify('should resolve to empty array when input promise does not resolve to an array (1)', function() {
    return when.map(resolved(123), mapper).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    );
  });

  specify('should resolve to empty array when input promise does not resolve to an array (2)', function() {
    return resolved(123).map(mapper).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    );
  });

  specify('should map input promises when mapper returns a promise', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2, 4, 6]);
      }
    );
  });

  specify('should reject when input contains rejection', function() {
    var input = [resolved(1), reject(2), resolved(3)];
    return when.map(input, mapper).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert(result === 2);
      }
    );
  });

});
