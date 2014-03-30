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

describe("Promise.method", function(){

  var thrower = Promise.method(function() {
    throw error;
  });

  var identity = Promise.method(function(val) {
    return val;
  });

  var array = Promise.method(function() {
    return [].slice.call(arguments);
  });

  var receiver = Promise.method(function() {
    return this;
  });

  specify("should reject when the function throws", function(done) {
    var async = false;
    thrower().then(assert.fail, function(e) {
      assert(async);
      assert(e === error);
    }).then(done, fail(done));
    async = true;
  });

  specify("should throw when the function is not a function", function() {
    try {
      Promise.method(null);
      assert.fail();
    }
    catch(e) {
      assert(e instanceof TypeError);
    }
  });

  specify("should call the function with the given receiver", function(done){
    var async = false;
    receiver.call(obj).then(function(val) {
      assert(async);
      assert(val === obj);
    }).then(done, fail(done));
    async = true;
  });

  specify("should call the function with the given value", function(done){
    var async = false;
    identity(obj).then(function(val) {
      assert(async);
      assert(val === obj);
    }).then(done, fail(done));
    async = true;
  });

  specify("should apply the function if given value is array", function(done){
    var async = false;
    array(1, 2, 3).then(function(val) {
      assert(async);
      assert.deepEqual(val, [1,2,3]);
    }).then(done, fail(done));
    async = true;
  });

  specify("should unwrap returned promise", function(done){
    var d = pending();

    Promise.method(function(){
      return d.promise;
    })().then(function(v){
      assert.deepEqual(v, 3);
    }).then(done, fail(done));

    setTimeout(function(){
      d.resolve(3);
    }, 13);
  });

  specify("should unwrap returned thenable", function(done){

    Promise.method(function(){
      return {
        then: function(f, v) {
          f(3);
        }
      };
    })().then(function(v){
      assert.deepEqual(v, 3);
    }).then(done, fail(done));
  });

  specify("should unwrap this and arguments", function(done){
    var THIS = {};
    var pThis = pending();
    var f = Promise.method(function(v) {
      assert(this === THIS);
      assert(v === 42);
    });
    f.call(pThis.promise, fulfilled(42)).then(done, fail(done));
    setTimeout(function(){
      pThis.resolve(THIS);
    }, 10);
  });
});
