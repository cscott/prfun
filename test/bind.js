/* eslint-disable max-len */
'use strict';

var assert = require('assert');
var Promise = require('../');

var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = Promise.defer.bind(Promise);

var THIS = { name: 'this' };

function CustomError1() {}
CustomError1.prototype = Object.create(Error.prototype);
function CustomError2() {}
CustomError2.prototype = Object.create(Error.prototype);


describe('when using .bind', function() {
  describe('with finally', function() {
    describe('this should refer to the bound object', function() {
      specify('in straight-forward handler', function() {
        return fulfilled().bind(THIS)['finally'](function() {
          assert(this === THIS);
        });
      });

      specify('after promise returned from finally resolves', function() {
        var d = pending();
        var promise = d.promise;
        var waited = false;

        setTimeout(function() {
          waited = true;
          d.resolve();
        }, 50);

        return fulfilled().bind(THIS)['finally'](function() {
          return promise;
        })['finally'](function() {
          assert(waited);
          assert(this === THIS);
        });
      });
    });
  });


  describe('with .delay', function() {
    describe('this should refer to the bound object', function() {
      specify('in straight-forward handler', function() {
        return fulfilled(3).bind(THIS).delay(5).then(function(v) {
          assert(v === 3);
          assert(this === THIS);
        });
      });
      specify('in rejected handler', function() {
        return rejected(3).bind(THIS).delay(5).then(assert.fail, function(v) {
          assert(v === 3);
          assert(this === THIS);
        });
      });
    });
  });


  describe('with .timeout', function() {
    describe('this should refer to the bound object', function() {
      specify('in straight-forward handler', function() {
        return fulfilled(3).bind(THIS).timeout(500).then(function(v) {
          assert(v === 3);
          assert(this === THIS);
        });
      });
      specify('in rejected handler', function() {
        return rejected(3).bind(THIS).timeout(500).then(assert.fail, function(v) {
          assert(v === 3);
          assert(this === THIS);
        });
      });

      specify('in rejected handler after timeout', function() {
        return new Promise(function() {})
          .bind(THIS).timeout(10).then(assert.fail)
          .caught(Promise.TimeoutError, function(err) { // eslint-disable-line no-unused-vars
            assert(this === THIS);
          });
      });
    });

  });


  describe('With #caught', function() {
    describe('this should refer to the bound object', function() {
      specify('in an immediately trapped catch handler', function() {
        return fulfilled().bind(THIS).then(function() {
          assert(THIS === this);
          var a;
          a.b();
        }).caught(Error, function(e) { // eslint-disable-line no-unused-vars
          assert(THIS === this);
        });
      });
      specify('in a later trapped catch handler', function() {
        return fulfilled().bind(THIS).then(function() {
          throw new CustomError1();
        }).caught(CustomError2, assert.fail)
          .caught(CustomError1, function(e) { // eslint-disable-line no-unused-vars
            assert(THIS === this);
          });
      });
    });
  });


  describe('With .try promises', function() {
    specify('this should refer to the bound object', function() {
      return Promise.bind(THIS).constructor.try(function() {
        assert(this !== THIS);
        return 42;
      }).then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
    specify('explicit context should override', function() {
      var NOTTHIS = {};
      return Promise.bind(THIS).constructor.try(function() {
        assert(this === NOTTHIS);
        return 42;
      }, NOTTHIS).then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
  });


  describe('With .method promises', function() {
    specify('this should refer to the bound object', function() {
      var f = Promise.bind(THIS).constructor.method(function() {
        assert(this !== THIS);
        return 42;
      });
      return f().then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
    specify('explicit context should override', function() {
      var NOTTHIS = {};
      var f = Promise.bind(THIS).constructor.method(function() {
        assert(this === NOTTHIS);
        return 42;
      });
      return f.call(NOTTHIS).then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
  });


  describe('With .guard promises', function() {
    specify('this should refer to the bound object', function() {
      var f = Promise.bind(THIS).constructor.guard(1, function() {
        assert(this !== THIS);
        return 42;
      });
      return f().then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
    specify('explicit context should override', function() {
      var NOTTHIS = {};
      var f = Promise.bind(THIS).constructor.guard(1, function() {
        assert(this === NOTTHIS);
        return 42;
      });
      return f.call(NOTTHIS).then(function(v) {
        assert(v === 42);
        assert(this === THIS);
      });
    });
  });


  describe('With #get promises', function() {
    specify('this should refer to the bound object', function() {
      return fulfilled({ key: 'value' }).bind(THIS).get('key').then(function(val) {
        assert(val === 'value');
        assert(this === THIS);
      });
    });
  });


  describe('With #call promises', function() {
    specify('this should refer to the bound object', function() {
      return fulfilled({ key: function() {return 'value';} }).bind(THIS).call('key').then(function(val) {
        assert(val === 'value');
        assert(this === THIS);
      });
    });
  });


  describe('With #return promises', function() {
    specify('this should refer to the bound object', function() {
      return fulfilled().bind(THIS).return('value').then(function(val) {
        assert(val === 'value');
        assert(this === THIS);
      });
    });
  });


  describe('With #throw promises', function() {
    specify('this should refer to the bound object', function() {
      return fulfilled().bind(THIS).throw('value').then(assert.fail, function(val) {
        assert(val === 'value');
        assert(this === THIS);
      });
    });
  });


  describe('With #spread promises', function() {

    describe('this should refer to the bound object', function() {
      specify('when spreading immediate array', function() {
        return fulfilled([1, 2, 3]).bind(THIS).spread(function(a, b, c) {
          assert(c === 3);
          assert(this === THIS);
        });
      });
      specify('when spreading eventual array', function() {
        var d = pending();
        var promise = d.promise;
        setTimeout(function() {
          d.resolve([1, 2, 3]);
        }, 50);
        return promise.bind(THIS).spread(function(a, b, c) {
          assert(c === 3);
          assert(this === THIS);
        });
      });

      specify('when spreading eventual array of eventual values', function() {
        var d = pending();
        var promise = d.promise;
        setTimeout(function() {
          var d1 = pending();
          var p1 = d1.promise;

          var d2 = pending();
          var p2 = d2.promise;

          var d3 = pending();
          var p3 = d3.promise;
          d.resolve([p1, p2, p3]);

          setTimeout(function() {
            d1.resolve(1);
            d2.resolve(2);
            d3.resolve(3);
          }, 3);
        }, 50);
        return promise.bind(THIS).spread(function(a, b, c) {
          assert(c === 3);
          assert(this === THIS);
        });
      });
    });
  });


  describe('With .promisify', function() {
    describe('this should refer to the bound object', function() {
      specify('on success', function() {
        var obj = { foo: function(cb) { cb(null, this.bar); }, bar: 42 };
        var foo = Promise.bind(THIS).constructor.promisify(obj.foo, false, obj);
        return foo().then(function(v) {
          assert(v === 42);
          assert(this === THIS);
        });
      });
      specify('on failure', function() {
        var obj = { foo: function(cb) { cb(this.bar); }, bar: 42 };
        var foo = Promise.bind(THIS).constructor.promisify(obj.foo, false, obj);
        return foo().then(assert.fail, function(v) {
          assert(v === 42);
          assert(this === THIS);
        });
      });
    });
  });

  describe('With #nodify', function() {
    describe('this should refer to the bound object', function() {
      specify('when the callback succeeeds', function(done) {
        fulfilled(3).bind(THIS).nodify(function(err, success) {
          try {
            assert(err === null);
            assert(success === 3);
            assert(this === THIS);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
      specify('when the callback errs', function(done) {
        rejected(3).bind(THIS).nodify(function(err, success) { // eslint-disable-line no-unused-vars
          try {
            assert(err === 3);
            assert(this === THIS);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });


  describe('With #map', function() {
    describe('this should refer to the bound object', function() {
      specify('inside the mapper with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).map(function(v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });
      specify('inside the mapper with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).map(function(v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });

      specify('after the mapper with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).map(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the mapper with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).map(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the mapper with immediate values when the map returns promises', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).map(function() {
          return p1;
        }).then(function() {
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).map(function() {
          return p1.then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });

  describe('With #reduce', function() {
    describe('this should refer to the bound object', function() {
      specify('inside the reducer with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).reduce(function(prev, v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });
      specify('inside the reducer with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).reduce(function(prev, v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });

      specify('after the reducer with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).reduce(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the reducer with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).reduce(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the reducer with immediate values when the reducer returns promise', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).reduce(function() {
          return p1;
        }).then(function() {
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).reduce(function() {
          return p1.then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });


  describe('With #reduceRight', function() {
    describe('this should refer to the bound object', function() {
      specify('inside the reducer with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).reduceRight(function(prev, v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });
      specify('inside the reducer with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).
              reduceRight(function(prev, v, i) {
          if (i === 2) {
            assert(this === THIS);
          }
        });
      });

      specify('after the reducer with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).reduceRight(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the reducer with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).reduceRight(function() {
          return 1;
        }).then(function() {
          assert(this === THIS);
        });
      });

      specify('after the reducer with immediate values when the reducer returns promise', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).reduceRight(function() {
          return p1;
        }).then(function() {
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).reduceRight(function() {
          return p1.then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });


  describe('With #all', function() {
    describe('this should refer to the bound object', function() {
      specify('after all with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).all().then(function(v) {
          assert(v.length === 3);
          assert(this === THIS);
        });
      });
      specify('after all with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).all().then(function(v) {
          assert(v.length === 3);
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).all(function() {
          return Promise.all([p1]).then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });


  describe('With .join', function() {
    describe('this should refer to the bound object', function() {
      specify('after join with immediate values', function() {
        return Promise.bind(THIS).constructor.join(1, 2, 3).then(function(v) {
          assert(v.length === 3);
          assert(this === THIS);
        });
      });
      specify('after join with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return Promise.bind(THIS).constructor.join(p1, p2, p3).then(function(v) {
          assert(v.length === 3);
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return Promise.bind(THIS).constructor.join(1, 2, 3).then(function() {
          return Promise.all([p1]).then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });


  describe('With #race', function() {
    describe('this should refer to the bound object', function() {
      specify('after race with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).race().then(function(v) {
          assert(v === 1);
          assert(this === THIS);
        });
      });
      specify('after race with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).race().then(function(v) {
          assert(v === 1);
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).race(function() {
          return Promise.race([p1]).then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });


  describe('With #props', function() {
    describe('this should refer to the bound object', function() {
      specify('after props with immediate values', function() {
        return fulfilled([1, 2, 3]).bind(THIS).props().then(function(v) {
          assert(v[2] === 3);
          assert(this === THIS);
        });
      });
      specify('after props with eventual values', function() {
        var d1 = pending();
        var p1 = d1.promise;

        var d2 = pending();
        var p2 = d2.promise;

        var d3 = pending();
        var p3 = d3.promise;

        setTimeout(function() {
          d1.resolve(1);
          d2.resolve(2);
          d3.resolve(3);
        }, 50);

        return fulfilled([p1, p2, p3]).bind(THIS).props().then(function(v) {
          assert(v[2] === 3);
          assert(this === THIS);
        });
      });
    });

    describe('this should not refer to the bound object', function() {
      specify('in the promises created within the handler', function() {
        var d1 = pending();
        var p1 = d1.promise;

        setTimeout(function() {
          d1.resolve(1);
        }, 50);

        return fulfilled([1, 2, 3]).bind(THIS).props(function() {
          return Promise.settle([p1]).then(function() {
            assert(this !== THIS);
            return 1;
          });
        }).then(function() {
          assert(this === THIS);
        });
      });
    });
  });

  specify('should not get confused', function() {
    var a = {};
    var b = {};
    var c = {};
    var dones = 0;

    return Promise.bind(a).then(function() {
      assert(this === a);
      ++dones;
    }).bind(b).then(function() {
      assert(this === b);
      ++dones;
    }).bind(c).then(function() {
      assert(this === c);
      ++dones;
    }).then(function() {
      assert(dones === 3);
    });
  });
});
