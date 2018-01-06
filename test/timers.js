/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var Promise = require('../');

/*
  Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to
  deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  sell copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  IN THE SOFTWARE.
*/

describe('timeout', function() {
  it('should do nothing if the promise fulfills quickly', function() {
    return Promise.delay(10).timeout(200);
  });

  it('should do nothing if the promise rejects quickly', function() {
    var goodError = new Error('haha!');
    return Promise.delay(10)
      .then(function() {
        throw goodError;
      })
      .timeout(200)
      .then(assert.fail, function(error) {
        assert(error === goodError);
      });
  });

  it('should reject with a timeout error if the promise is too slow', function() {
    var caught = false;
    return Promise.delay(100)
      .timeout(10)
      .caught(Promise.TimeoutError, function() {
        caught = true;
      }).then(function() {
        assert(caught);
      });
  });

  it('should reject with a custom timeout error if the promise is too slow and msg was provided', function() {
    var caught = false;
    return Promise.delay(100)
      .timeout(10, 'custom')
      .caught(Promise.TimeoutError, function(e) {
        assert(/custom/i.test(e.message));
        caught = true;
      }).then(function() {
        assert(caught);
      });
  });
});

describe('delay', function() {
  it('should delay fulfillment', function(done) {
    var pending = true;
    Promise.delay(30)['finally'](function() { pending = false; }).done();

    setTimeout(function() {
      assert(pending);
      setTimeout(function() {
        assert(!pending);
        done();
      }, 30);
    }, 15);
  });

  it('should not delay rejection', function() {
    var pending = true;
    Promise.reject(5).delay(50)['finally'](function() { pending = false; })
      ['catch'](function() {}).done();

    return Promise.delay(20).then(function() {
      assert(!pending);
    });
  });

  it('should treat a single argument as a time', function(done) {
    var pending = true;
    Promise.delay(60)['finally'](function() { pending = false; }).done();

    setTimeout(function() {
      assert(pending);
      done();
    }, 30);

  });

  it('should treat two arguments as a value + a time', function() {
    var pending = true;
    var promise =
      Promise.delay('what', 40)['finally'](function() { pending = false; });

    return Promise.delay(20).then(function() {
      assert(pending);
    }).then(function() {
      return promise;
    }).then(function(value) {
      assert(!pending);
      assert(value === 'what');
    });
  });

  it('should delay after resolution', function() {
    var promise1 = Promise.delay('what', 20);
    var promise2 = promise1.delay(40);
    var pending1 = true;
    var pending2 = true;
    promise1 = promise1['finally'](function() { pending1 = false; });
    promise2 = promise2['finally'](function() { pending2 = false; });

    return Promise.delay(40).then(function() {
      assert(!pending1);
      assert(pending2);
    }).then(function() {
      return promise2;
    }).then(function(value) {
      assert(!pending2);
      assert(value === 'what');
    });
  });
});
