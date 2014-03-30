"use strict";

var assert = require("assert");
require('../');

var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = Promise.defer.bind(Promise);

function fail(done) {
  return function(e) { done(e); };
}

describe("Promise.props", function () {

  specify("should reject undefined", function(done) {
    Promise.props().then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    }).then(done, fail(done));
  });

  specify("should reject primitive", function(done) {
    Promise.props("str").then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    }).then(done, fail(done));
  });

  specify("should resolve to new object", function(done) {
    var o = {};
    Promise.props(o).then(function(v){
      assert( v !== o );
      assert.deepEqual(o, v);
    }).then(done, fail(done));
  });

  specify("should resolve value properties", function(done) {
    var o = {
      one: 1,
      two: 2,
      three: 3
    };
    Promise.props(o).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));
  });

  specify("should resolve immediate properties", function(done) {
    var o = {
      one: fulfilled(1),
      two: fulfilled(2),
      three: fulfilled(3)
    };
    Promise.props(o).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));
  });

  specify("should resolve eventual properties", function(done) {
    var d1 = pending(),
    d2 = pending(),
    d3 = pending();
    var o = {
      one: d1.promise,
      two: d2.promise,
      three: d3.promise
    };
    Promise.props(o).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));

    setTimeout(function(){
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
    }, 13);
  });

  specify("should reject if any input promise rejects", function(done) {
    var o = {
      one: fulfilled(1),
      two: rejected(2),
      three: fulfilled(3)
    };
    Promise.props(o).then(assert.fail, function(v){
      assert( v === 2 );
    }).then(done, fail(done));
  });

  specify("should accept a promise for an object", function(done) {
    var o = {
      one: fulfilled(1),
      two: fulfilled(2),
      three: fulfilled(3)
    };
    var d1 = pending();
    Promise.props(d1.promise).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));
    setTimeout(function(){
      d1.resolve(o);
    }, 13);
  });

  specify("should reject a promise for a primitive", function(done) {
    var d1 = pending();
    Promise.props(d1.promise).then(assert.fail, function(e) {
      assert(e instanceof TypeError);
    }).then(done, fail(done));
    setTimeout(function(){
      d1.resolve("text");
    }, 13);
  });

  specify("should accept thenables in properties", function(done) {
    var t1 = {then: function(cb){cb(1);}};
    var t2 = {then: function(cb){cb(2);}};
    var t3 = {then: function(cb){cb(3);}};
    var o = {
      one: t1,
      two: t2,
      three: t3
    };
    Promise.props(o).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));
  });

  specify("should accept a thenable for thenables in properties", function(done) {
    var o = {
      then: function (f) {
        f({
          one: {
            then: function (cb) {
              cb(1);
            }
          },
          two: {
            then: function (cb) {
              cb(2);
            }
          },
          three: {
            then: function (cb) {
              cb(3);
            }
          }
        });
      }
    };
    Promise.props(o).then(function(v){
      assert.deepEqual({
        one: 1,
        two: 2,
        three: 3
      }, v);
    }).then(done, fail(done));
  });

  /*
    specify("sends { key, value } progress updates", function(done) {
    var deferred1 = Q.defer();
    var deferred2 = Q.defer();

    var progressValues = [];

    Q.delay(50).then(function () {
    deferred1.notify("a");
    });
    Q.delay(100).then(function () {
    deferred2.notify("b");
    deferred2.resolve();
    });
    Q.delay(150).then(function () {
    deferred1.notify("c");
    deferred1.resolve();
    });

    Promise.props({
    one: deferred1.promise,
    two: deferred2.promise
    }).then(function () {
    assert.deepEqual(progressValues, [
    { key: "one", value: "a" },
    { key: "two", value: "b" },
    { key: "one", value: "c" }
    ]);
    done();
    },
    undefined,
    function (progressValue) {
    progressValues.push(progressValue);
    });
    });
  */

  specify("treats arrays for their properties", function(done) {
    var o = [1,2,3];

    Promise.props(o).then(function(v){
      assert.deepEqual({
        0: 1,
        1: 2,
        2: 3
      }, v);
    }).then(done, fail(done));
  });

});
