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

var delay = Promise.delay.bind(Promise);

var sentinel = {};

describe("when.reduce-test", function () {

  function plus(sum, val) {
    return sum + val;
  }

  function later(val) {
    return delay(val, Math.random() * 10);
  }


  specify("should reduce values without initial value", function(done) {
    when.reduce([1,2,3], plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    ).then(done, fail(done));
  });

  specify("should reduce values with initial value", function(done) {
    when.reduce([1,2,3], plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduce values with initial promise", function(done) {
    when.reduce([1,2,3], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduce promised values without initial value", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduce(input, plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    ).then(done, fail(done));
  });

  specify("should reduce promised values with initial value", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduce(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduce promised values with initial promise", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduce(input, plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduce empty input with initial value", function(done) {
    var input = [];
    when.reduce(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should reduce empty input with initial promise", function(done) {
    when.reduce([], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should reject when input contains rejection", function(done) {
    var input = [resolved(1), rejected(2), resolved(3)];
    when.reduce(input, plus, resolved(1)).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert.deepEqual(result, 2);
      }
    ).then(done, fail(done));
  });

  specify("should reject with empty array", function(done) {
    when.reduce([], plus).caught(TypeError, function(e) { done(); });
  });

  specify("should reduce to initial value with empty array", function(done) {
    when.reduce([], plus, sentinel).then(function(r){
      assert(r === sentinel);
    }).then(done, fail(done));
  });

  specify("should reduce in left-to-right order", function(done) {
    when.reduce([later(1), later(2), later(3)], plus, '').then(
      function(result) {
        assert.deepEqual(result, '123');
      }
    ).then(done, fail(done));
  });

  specify("should accept a promise for an array", function(done) {
    when.reduce(resolved([1, 2, 3]), plus, '').then(
      function(result) {
        assert.deepEqual(result, '123');
      }
    ).then(done, fail(done));
  });

  specify("should resolve to initialValue when input promise does not resolve to an array", function(done) {
    when.reduce(resolved(123), plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should provide correct basis value", function(done) {
    function insertIntoArray(arr, val, i) {
      arr[i] = val;
      return arr;
    }

    when.reduce([later(1), later(2), later(3)], insertIntoArray, []).then(
      function(result) {
        assert.deepEqual(result, [1,2,3]);
      }
    ).then(done, fail(done));
  });
});

describe("when.reduceRight-test", function () {

  function plus(sum, val) {
    return sum + val;
  }

  function later(val) {
    return delay(val, Math.random() * 10);
  }


  specify("should reduceRight values without initial value", function(done) {
    when.reduceRight([1,2,3], plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight values with initial value", function(done) {
    when.reduceRight([1,2,3], plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight values with initial promise", function(done) {
    when.reduceRight([1,2,3], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight promised values without initial value", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduceRight(input, plus).then(
      function(result) {
        assert.deepEqual(result, 6);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight promised values with initial value", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduceRight(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight promised values with initial promise", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.reduceRight(input, plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 7);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight empty input with initial value", function(done) {
    var input = [];
    when.reduceRight(input, plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should reduceRight empty input with initial promise", function(done) {
    when.reduceRight([], plus, resolved(1)).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should reject when input contains rejection", function(done) {
    var input = [resolved(1), rejected(2), resolved(3)];
    when.reduceRight(input, plus, resolved(1)).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert.deepEqual(result, 2);
      }
    ).then(done, fail(done));
  });

  specify("should reject with empty array", function(done) {
    when.reduceRight([], plus).caught(TypeError, function(e) { done(); });
  });

  specify("should reduceRight to initial value with empty array", function(done) {
    when.reduceRight([], plus, sentinel).then(function(r){
      assert(r === sentinel);
    }).then(done, fail(done));
  });

  specify("should reduceRight in right-to-left order", function(done) {
    when.reduceRight([later(1), later(2), later(3)], plus, '').then(
      function(result) {
        assert.deepEqual(result, '321');
      }
    ).then(done, fail(done));
  });

  specify("should accept a promise for an array", function(done) {
    when.reduceRight(resolved([1, 2, 3]), plus, '').then(
      function(result) {
        assert.deepEqual(result, '321');
      }
    ).then(done, fail(done));
  });

  specify("should resolve to initialValue when input promise does not resolve to an array", function(done) {
    when.reduceRight(resolved(123), plus, 1).then(
      function(result) {
        assert.deepEqual(result, 1);
      }
    ).then(done, fail(done));
  });

  specify("should provide correct basis value", function(done) {
    function insertIntoArray(arr, val, i) {
      arr[i] = val;
      return arr;
    }

    when.reduceRight([later(1), later(2), later(3)], insertIntoArray, []).then(
      function(result) {
        assert.deepEqual(result, [1,2,3]);
      }
    ).then(done, fail(done));
  });
});
