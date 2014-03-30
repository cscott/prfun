"use strict";

var assert = require("assert");
require('../');

var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = Promise.defer.bind(Promise);

function fail(done) {
  return function(e) { done(e); };
}

var obj = {};
var error = new Error();
var thrower = function() {
  throw error;
};

var identity = function(val) {
  return val;
};

var array = function() {
  return [].slice.call(arguments);
};

var receiver = function() {
  return this;
};

var tryy = Promise["try"].bind(Promise);

describe("Promise.try", function(){
  specify("should reject when the function throws", function(done) {
    var async = false;
    tryy(thrower).then(assert.fail, function(e) {
      assert(async);
      assert(e === error);
    }).then(done, fail(done));
    async = true;
  });
  specify("should reject when the function is not a function", function(done) {
    var async = false;
    tryy(null).then(assert.fail, function(e) {
      assert(async);
      assert(e instanceof TypeError);
    }).then(done, fail(done));
    async = true;
  });
  specify("should call the function with the given receiver", function(done){
    var async = false;
    tryy(receiver, obj).then(function(val) {
      assert(async);
      assert(val === obj);
    }).then(done, fail(done));
    async = true;
  });
  specify("should call the function with the given value", function(done){
    var async = false;
    tryy(identity, null, obj).then(function(val) {
      assert(async);
      assert(val === obj);
    }).then(done, fail(done));
    async = true;
  });
  specify("should call the function with the given values", function(done){
    var async = false;
    tryy(array, null, 1, 2, 3).then(function(val) {
      assert(async);
      assert.deepEqual(val, [1,2,3]);
    }).then(done, fail(done));
    async = true;
  });

  specify("should unwrap this and arguments", function(done){
    var d = pending();
    var THIS = {};
    tryy(function(v) {
      assert(this === THIS);
      assert(v === 42);
    }, d.promise, fulfilled(42)
    ).then(done, fail(done));

    setTimeout(function(){
      d.resolve(THIS);
    }, 10);
  });

  specify("should unwrap returned promise", function(done){
    var d = pending();

    tryy(function(){
      return d.promise;
    }).then(function(v){
      assert(v === 3);
    }).then(done, fail(done));

    setTimeout(function(){
      d.resolve(3);
    }, 13);
  });
  specify("should unwrap returned thenable", function(done){

    tryy(function(){
      return {
        then: function(f, v) {
          f(3);
        }
      };
    }).then(function(v){
      assert(v === 3);
    }).then(done, fail(done));
  });
});
