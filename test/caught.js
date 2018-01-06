/* eslint-disable max-len */
/* eslint no-unused-vars: ["error", { "args": "none" }] */
'use strict';

var assert = require('assert');
var Promise = require('../');

var pending = Promise.defer.bind(Promise);

var CustomError = function() {};
CustomError.prototype = new Error();

var predicateFilter = function(e) {
  return (/invalid/).test(e.message);
};

function predicatesUndefined(e) {
  return e === void 0;
}

function predicatesPrimitiveString(e) {
  return /^asd$/.test(e);
}

describe('A promise handler that throws a TypeError must be caught', function() {

  specify('in a middle.caught filter', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a generic.caught filter that comes first', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(function(e) {
      caught = true;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('in an explicitly generic.caught filter that comes first', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(Error, function(e) {
      caught = true;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(Promise.TypeError, function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('in a specific handler after thrown in generic', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(function(e) {
      throw e;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a multi-filter handler', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(SyntaxError, TypeError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a specific handler after non-matching multi.caught handler', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      a.b.c.d();
    }).caught(SyntaxError, CustomError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

});


describe('A promise handler that throws a custom error', function() {

  specify('Is filtered if inheritance was done even remotely properly', function() {
    var a = pending();
    var b = new CustomError();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw b;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      assert.equal(e, b);
      caught = true;
    }).then(function() {
      assert(caught);
    });
  });

  specify('Is filtered along with built-in errors', function() {
    var a = pending();
    var b = new CustomError();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw b;
    }).caught(TypeError, SyntaxError, CustomError, function(e) {
      caught = true;
    }).caught(
      assert.fail
    ).then(function() {
      assert(caught);
    });
  });
});

describe('A promise handler that throws a CustomError must be caught', function() {
  specify('in a middle.caught filter', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a generic.caught filter that comes first', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(function(e) {
      caught = true;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('in an explicitly generic.caught filter that comes first', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(Error, function(e) {
      caught = true;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('in a specific handler after thrown in generic', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(function(e) {
      throw e;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a multi-filter handler', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(SyntaxError, CustomError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });


  specify('in a specific handler after non-matching multi.caught handler', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError();
    }).caught(SyntaxError, TypeError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

});

describe('A promise handler that is caught in a filter', function() {

  specify('is continued normally after returning a promise in filter', function() {
    var a = pending();
    var c = pending();
    var b = new CustomError();

    setTimeout(function() { a.resolve(3); }, 10);
    setTimeout(function() { c.resolve(3); }, 20);

    return a.promise.then(function(v) {
      assert.equal(v, 3);
      throw b;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      assert.equal(e, b);
      return c.promise;
    }).then(function(v) {
      assert.equal(v, 3);
    });
  });

  specify('is continued normally after returning a promise in original handler', function() {
    var a = pending();
    var c = pending();

    setTimeout(function() { a.resolve(3); }, 10);
    setTimeout(function() { c.resolve(3); }, 20);

    return a.promise.then(function(v) {
      assert.equal(v, 3);
      return c.promise;
    }).caught(SyntaxError, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      assert.fail();
    }).caught(CustomError, function(e) {
      assert.fail();
    }).then(function(v) {
      assert.equal(v, 3);
    });
  });
});

describe('A promise handler with a predicate filter', function() {

  specify('will catch a thrown thing matching the filter', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new Error('horrible invalid error string');
    }).caught(predicateFilter, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('will NOT catch a thrown thing not matching the filter', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new Error('horrible valid error string');
    }).caught(predicateFilter, function(e) {
      assert.fail();
    }).caught(function(e) {
      caught = true;
    }).then(function() {
      assert(caught);
    });
  });

  specify('will fail when a predicate is a bad error class', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new Error('horrible custom error');
    }).caught(123, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      // Uncomment to show the TypeError stack
      // console.error(e.stack);
      caught = true;
    }).then(function() {
      assert(caught);
    });
  });

  specify('will catch a thrown undefiend', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw void 0;
    }).caught(function(e) { return false; }, function(e) {
      assert.fail();
    }).caught(predicatesUndefined, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('will catch a thrown string', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw 'asd';
    }).caught(function(e) { return false; }, function(e) {
      assert.fail();
    }).caught(predicatesPrimitiveString, function(e) {
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

  specify('will fail when a predicate throws', function() {
    var a = pending();
    var caught = false;

    setTimeout(function() { a.resolve(3); }, 10);

    return a.promise.then(function() {
      throw new CustomError('error happens');
    }).caught(function(e) { return e.f.g; }, function(e) {
      assert.fail();
    }).caught(TypeError, function(e) {
      // Uncomment to show the TypeError stack
      // console.error(e.stack);
      caught = true;
    }).caught(function(e) {
      assert.fail();
    }).then(function() {
      assert(caught);
    });
  });

});
