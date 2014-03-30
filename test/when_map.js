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
var reject = Promise.reject.bind(Promise);

function fail(done) {
  return function(e) { done(e); };
}

var delay = Promise.delay.bind(Promise);

describe("when.map-test", function () {

  function mapper(val) {
    return val * 2;
  }

  function deferredMapper(val) {
    return delay(mapper(val), Math.random()*10);
  }

  specify("should map input values array", function(done) {
    var input = [1, 2, 3];
    when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should map input promises array", function(done) {
    var input = [resolved(1), resolved(2), resolved(3)];
    when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should map mixed input array", function(done) {
    var input = [1, resolved(2), 3];
    when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should map input when mapper returns a promise", function(done) {
    var input = [1,2,3];
    when.map(input, deferredMapper).then(
      function(results) {
        assert.deepEqual(results, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should accept a promise for an array (1)", function(done) {
    when.map(resolved([1, resolved(2), 3]), mapper).then(
      function(result) {
        assert.deepEqual(result, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should accept a promise for an array (2)", function(done) {
    resolved([1, resolved(2), 3]).map(mapper).then(
      function(result) {
        assert.deepEqual(result, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should resolve to empty array when input promise does not resolve to an array (1)", function(done) {
    when.map(resolved(123), mapper).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    ).then(done, fail(done));
  });

  specify("should resolve to empty array when input promise does not resolve to an array (2)", function(done) {
    resolved(123).map(mapper).then(
      function(result) {
        assert.deepEqual(result, []);
      }
    ).then(done, fail(done));
  });

  specify("should map input promises when mapper returns a promise", function(done) {
    var input = [resolved(1),resolved(2),resolved(3)];
    when.map(input, mapper).then(
      function(results) {
        assert.deepEqual(results, [2,4,6]);
      }
    ).then(done, fail(done));
  });

  specify("should reject when input contains rejection", function(done) {
    var input = [resolved(1), reject(2), resolved(3)];
    when.map(input, mapper).then(
      function() { throw new Error('should not reach here'); },
      function(result) {
        assert( result === 2 );
      }
    ).then(done, fail(done));
  });

/*
  specify("should propagate progress", function(done) {
    var input = [1, 2, 3];
    var donecalls = 0;
    function donecall() {
      if( ++donecalls === 3 ) done();
    }

    when.map(input, function(x) {
      var d = when.pending();
      d.progress(x);
      setTimeout(d.fulfill.bind(d, x), 0);
      return d.promise;
    }).then(null, null, function(update) {
      assert(update.value === input.shift());
      donecall();
    });
  });

  specify("should propagate progress 2", function(done) {
    // Thanks @depeele for this test
    var input, ncall;

    input = [_resolver(1), _resolver(2), _resolver(3)];
    ncall = 0;

    function identity(x) {
      return x;
    }
    //This test didn't contain the mapper argument so I assume
    //when.js uses identity mapper in such cases.

    //In bluebird it's illegal to call Promise.map without mapper function
    return when.map(input, identity).then(function () {
      assert(ncall === 6);
      done();
    }, fail, function () {
      ncall++;
    });

    function _resolver(id) {
      var p = when.defer();

      setTimeout(function () {
        var loop, timer;

        loop = 0;
        timer = setInterval(function () {
          p.notify(id);
          loop++;
          if (loop === 2) {
            clearInterval(timer);
            p.resolve(id);
          }
        }, 1);
      }, 0);

      return p.promise;
    }

  });
*/
});
