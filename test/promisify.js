/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var Promise = require('../');

var RejectionError = function() {};

var sentinel = {};
var sentinelError = new RejectionError();

var erroneousNode = function(a, b, c, cb) {
  setTimeout(function() {
    cb(sentinelError);
  }, 10);
};

var successNode = function(a, b, c, cb) {
  setTimeout(function() {
    cb(null, sentinel);
  }, 10);
};

var successNodeMultipleValues = function(a, b, c, cb) {
  setTimeout(function() {
    cb(null, sentinel, sentinel, sentinel);
  }, 10);
};

var syncErroneousNode = function(a, b, c, cb) {
  cb(sentinelError);
};

var syncSuccessNode = function(a, b, c, cb) {
  cb(null, sentinel);
};

var syncSuccessNodeMultipleValues = function(a, b, c, cb) {
  cb(null, sentinel, sentinel, sentinel);
};

var errToThrow;
var thrower = Promise.promisify(function(a, b, c, cb) { // eslint-disable-line no-unused-vars
  errToThrow = new RejectionError();
  throw errToThrow;
});

var tprimitive = 'Where is your stack now?';
var throwsStrings = Promise.promisify(function(cb) { // eslint-disable-line no-unused-vars
  throw tprimitive;
});

var errbacksStrings = Promise.promisify(function(cb) {
  cb(tprimitive);
});

var errbacksStringsAsync = Promise.promisify(function(cb) {
  setTimeout(function() {
    cb(tprimitive);
  }, 13);
});

var error = Promise.promisify(erroneousNode);
var success = Promise.promisify(successNode);
var successMulti = Promise.promisify(successNodeMultipleValues, true);
var successMulti2 = Promise.promisify(successNodeMultipleValues, ['a', 'b', 'c', 'd']);
var syncError = Promise.promisify(syncErroneousNode);
var syncSuccess = Promise.promisify(syncSuccessNode);
var syncSuccessMulti = Promise.promisify(syncSuccessNodeMultipleValues, true);
var syncSuccessMulti2 = Promise.promisify(syncSuccessNodeMultipleValues, ['a', 'b', 'c', 'd']);

describe('when calling promisified function it should ', function() {


  specify('return a promise that is pending', function() {
    var pending = true;
    var a = error(1, 2, 3);
    var b = success(1, 2, 3);
    var c = successMulti(1, 2, 3);
    var d = successMulti2(1, 2, 3);

    a['finally'](function() { pending = false; });
    b['finally'](function() { pending = false; });
    c['finally'](function() { pending = false; });
    d['finally'](function() { pending = false; });

    assert.equal(pending, true);

    return a.then(assert.fail, function() { /* Caught */ })
      .return(b).return(c).return(d).return();
  });

  specify('should use this if no receiver was given', function() {
    var o = {};
    var fn = Promise.promisify(function(cb) {

      cb(null, this === o);
    });

    o.fn = fn;

    return o.fn().then(function(val) {
      assert(val);
    });
  });

  specify('call future attached handlers later', function(done) {
    var a = error(1, 2, 3);
    var b = success(1, 2, 3);
    var c = successMulti(1, 2, 3);
    var c2 = successMulti2(1, 2, 3);
    var d = syncError(1, 2, 3);
    var e = syncSuccess(1, 2, 3);
    var f = syncSuccessMulti(1, 2, 3);
    var f2 = syncSuccessMulti2(1, 2, 3);
    var calls = 0;
    function donecall() {
      if ((++calls) === 8) {
        done();
      }
    }

    a.caught(function() {});
    d.caught(function() {});

    setTimeout(function() {
      a.then(assert.fail, donecall);
      b.then(donecall, assert.fail);
      c.then(donecall, assert.fail);
      c2.then(donecall, assert.fail);
      d.then(assert.fail, donecall);
      e.then(donecall, assert.fail);
      f.then(donecall, assert.fail);
      f2.then(donecall, assert.fail);
    }, 20);
  });

  specify('Reject with the synchronously caught reason', function() {
    return thrower(1, 2, 3).then(assert.fail, function(e) {
      assert(e === errToThrow);
    });
  });

  specify('reject with the proper reason', function(done) {
    var a = error(1, 2, 3);
    var b = syncError(1, 2, 3);
    var calls = 0;
    function donecall() {
      if ((++calls) === 2) {
        done();
      }
    }

    a.caught(function(e) {
      assert.equal(sentinelError, e);
      donecall();
    });
    b.caught(function(e) {
      assert.equal(sentinelError, e);
      donecall();
    });
  });

  specify('fulfill with proper value(s)', function() {
    var a = success(1, 2, 3);
    var b = successMulti(1, 2, 3);
    var b2 = successMulti2(1, 2, 3);
    var c = syncSuccess(1, 2, 3);
    var d = syncSuccessMulti(1, 2, 3);
    var d2 = syncSuccessMulti2(1, 2, 3);

    return Promise.join(

    a.then(function(val) {
      assert.equal(val, sentinel);
    }),

    b.then(function(val) {
      assert.deepEqual(val, [sentinel, sentinel, sentinel]);
    }),

    b2.then(function(val) {
      assert.deepEqual(val, { a: sentinel, b: sentinel, c: sentinel, d: undefined });
    }),

    c.then(function(val) {
      assert.equal(val, sentinel);
    }),

    d.then(function(val) {
      assert.deepEqual(val, [sentinel, sentinel, sentinel]);
    }),

    d2.then(function(val) {
      assert.deepEqual(val, { a: sentinel, b: sentinel, c: sentinel, d: undefined });
    })

    );
  });


});


describe('with more than 5 arguments', function() {

  var o = {
    value: 15,

    f: function(a, b, c, d, e, f, g, cb) {
      cb(null, [a, b, c, d, e, f, g, this.value]);
    },

  };

  var prom = Promise.promisify(o.f, false, o);

  specify('receiver should still work', function() {
    return prom(1, 2, 3, 4, 5, 6, 7).then(function(val) {
      assert.deepEqual(
        val,
        [1, 2, 3, 4, 5, 6, 7, 15]
      );
    });

  });

});

// In prfun, we don't wrap primitive errors.
describe.skip('Primitive errors wrapping', function() {
  specify('when the node function throws it', function() {
    return throwsStrings().then(assert.fail, function(e) {
      assert(e instanceof Error);
      assert(e.message === tprimitive);
    });
  });

  specify('when the node function throws it inside then', function() {
    return Promise.resolve().then(function() {
      return throwsStrings().then(assert.fail, function(e) {
        assert(e instanceof Error);
        assert(e.message === tprimitive);
      });
    });
  });


  specify('when the node function errbacks it synchronously', function() {
    return errbacksStrings().then(assert.fail, function(e) {
      assert(e instanceof Error);
      assert(e.message === tprimitive);
    });
  });

  specify('when the node function errbacks it synchronously inside then', function() {
    return Promise.resolve().then(function() {
      errbacksStrings().then(assert.fail, function(e) {
        assert(e instanceof Error);
        assert(e.message === tprimitive);
      });
    });
  });

  specify('when the node function errbacks it asynchronously', function() {
    return errbacksStringsAsync().then(assert.fail, function(e) {
      assert(e instanceof Error);
      assert(e.message === tprimitive);
    });
  });

  specify('when the node function errbacks it asynchronously inside then', function() {
    return Promise.resolve().then(function() {
      errbacksStringsAsync().then(assert.fail, function(e) {
        assert(e instanceof Error);
        assert(e.message === tprimitive);
      });
    });
  });
});

// In prfun, we don't wrap primitive errors.
// Also, we don't support Promise#error()
describe.skip('RejectionError wrapping', function() {

  var CustomError = function() { };

  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;

  function isUntypedError(obj) {
    return obj instanceof Error &&
      Object.getPrototypeOf(obj) === Error.prototype;
  }


  if (!isUntypedError(new Error())) {
    console.log('error must be untyped');
  }

  if (isUntypedError(new CustomError())) {
    console.log('customerror must be typed');
  }

  var stringback = function(cb) {
    cb('Primitive as error');
  };

  var errback = function(cb) {
    cb(new Error('error as error'));
  };

  var typeback = function(cb) {
    cb(new CustomError());
  };

  var stringthrow = function(cb) { // eslint-disable-line no-unused-vars
    throw ('Primitive as error');
  };

  var errthrow = function(cb) { // eslint-disable-line no-unused-vars
    throw (new Error('error as error'));
  };

  var typethrow = function(cb) { // eslint-disable-line no-unused-vars
    throw (new CustomError());
  };

  stringback = Promise.promisify(stringback);
  errback = Promise.promisify(errback);
  typeback = Promise.promisify(typeback);
  stringthrow = Promise.promisify(stringthrow);
  errthrow = Promise.promisify(errthrow);
  typethrow = Promise.promisify(typethrow);

  specify('should wrap stringback', function(done) {
    stringback().error(function(e) {
      assert(e instanceof RejectionError);
      done();
    });
  });

  specify('should wrap errback', function(done) {
    errback().error(function(e) {
      assert(e instanceof RejectionError);
      done();
    });
  });

  specify('should not wrap typeback', function(done) {
    typeback().caught(CustomError, function(e) { // eslint-disable-line no-unused-vars
      done();
    });
  });

  specify('should not wrap stringthrow', function(done) {
    stringthrow().error(assert.fail).caught(function(e) {
      assert(e instanceof Error);
      done();
    });
  });

  specify('should not wrap errthrow', function(done) {
    errthrow().error(assert.fail).caught(function(e) {
      assert(e instanceof Error);
      done();
    });
  });

  specify('should not wrap typethrow', function(done) {
    typethrow().error(assert.fail)
      .caught(CustomError, function(e) { // eslint-disable-line no-unused-vars
        done();
      });
  });
});
