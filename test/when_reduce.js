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

var delay = Promise.delay.bind(Promise);

var sentinel = {};

describe('when.reduce-test', function() {

  function plus(sum, val) {
    return sum + val;
  }

  function later(val) {
    return delay(val, Math.random() * 10);
  }


  specify('should reduce values without initial value', function() {
    return when.reduce([1, 2, 3], plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    );
  });

  specify('should reduce values with initial value', function() {
    return when.reduce([1, 2, 3], plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduce values with initial promise', function() {
    return when.reduce([1, 2, 3], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduce promised values without initial value', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduce(input, plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    );
  });

  specify('should reduce promised values with initial value', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduce(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduce promised values with initial promise', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduce(input, plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduce empty input with initial value', function() {
    var input = [];
    return when.reduce(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should reduce empty input with initial promise', function() {
    return when.reduce([], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should reject when input contains rejection', function() {
    var input = [resolved(1), rejected(2), resolved(3)];
    return when.reduce(input, plus, resolved(1)).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert.deepEqual(result, 2);
      }
    );
  });

  specify('should reject with empty array', function() {
    var caught = false;
    return when.reduce([], plus).caught(TypeError, function(e) { // eslint-disable-line no-unused-vars
      caught = true;
    }).then(function() {
      assert.deepEqual(caught, true);
    });
  });

  specify('should reduce to initial value with empty array', function() {
    return when.reduce([], plus, sentinel).then(function(r) {
      assert(r === sentinel);
    });
  });

  specify('should reduce in left-to-right order', function() {
    return when.reduce([later(1), later(2), later(3)], plus, '').then(
      function(result) {
        assert.deepEqual(result, '123');
      }
    );
  });

  specify('should accept a promise for an array', function() {
    return when.reduce(resolved([1, 2, 3]), plus, '').then(
      function(result) {
        assert.deepEqual(result, '123');
      }
    );
  });

  specify('should resolve to initialValue when input promise does not resolve to an array', function() {
    return when.reduce(resolved(123), plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should provide correct basis value', function() {
    function insertIntoArray(arr, val, i) {
      arr[i] = val;
      return arr;
    }

    return when.reduce([later(1), later(2), later(3)], insertIntoArray, []).then(
      function(result) {
        assert.deepEqual(result, [1, 2, 3]);
      }
    );
  });
});

describe('when.reduceRight-test', function() {

  function plus(sum, val) {
    return sum + val;
  }

  function later(val) {
    return delay(val, Math.random() * 10);
  }


  specify('should reduceRight values without initial value', function() {
    return when.reduceRight([1, 2, 3], plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    );
  });

  specify('should reduceRight values with initial value', function() {
    return when.reduceRight([1, 2, 3], plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduceRight values with initial promise', function() {
    return when.reduceRight([1, 2, 3], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduceRight promised values without initial value', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduceRight(input, plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    );
  });

  specify('should reduceRight promised values with initial value', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduceRight(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduceRight promised values with initial promise', function() {
    var input = [resolved(1), resolved(2), resolved(3)];
    return when.reduceRight(input, plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    );
  });

  specify('should reduceRight empty input with initial value', function() {
    var input = [];
    return when.reduceRight(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should reduceRight empty input with initial promise', function() {
    return when.reduceRight([], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should reject when input contains rejection', function() {
    var input = [resolved(1), rejected(2), resolved(3)];
    return when.reduceRight(input, plus, resolved(1)).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert.deepEqual(result, 2);
      }
    );
  });

  specify('should reject with empty array', function() {
    var caught = false;
    return when.reduceRight([], plus).caught(TypeError, function(e) { // eslint-disable-line no-unused-vars
      caught = true;
    }).then(function() {
      assert.deepEqual(caught, true);
    });
  });

  specify('should reduceRight to initial value with empty array', function() {
    return when.reduceRight([], plus, sentinel).then(function(r) {
      assert(r === sentinel);
    });
  });

  specify('should reduceRight in right-to-left order', function() {
    return when.reduceRight([later(1), later(2), later(3)], plus, '').then(
      function(result) {
        assert.deepEqual(result, '321');
      }
    );
  });

  specify('should accept a promise for an array', function() {
    return when.reduceRight(resolved([1, 2, 3]), plus, '').then(
      function(result) {
        assert.deepEqual(result, '321');
      }
    );
  });

  specify('should resolve to initialValue when input promise does not resolve to an array', function() {
    return when.reduceRight(resolved(123), plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    );
  });

  specify('should provide correct basis value', function() {
    function insertIntoArray(arr, val, i) {
      arr[i] = val;
      return arr;
    }

    return when.reduceRight([later(1), later(2), later(3)], insertIntoArray, []).then(
      function(result) {
        assert.deepEqual(result, [1, 2, 3]);
      }
    );
  });
});
