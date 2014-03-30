"use strict";
/* jshint evil:true */

// bail if we're not running in node >= 0.11
var node11 = parseInt(process.versions.node.split(".")[1], 10) >= 11;
if (!node11) { return; }

var assert = require("assert");
require('../');

function fail(done) {
  return function(e) { done(e); };
}

function get(arg) {
  return {
    then: function(ful, rej) {
      ful(arg);
    }
  };
}

function fail(arg) {
  return {
    then: function(ful, rej) {
      rej(arg);
    }
  };
}

function delay() {
  return new Promise(function(a){
    setTimeout(a, 15);
  });
}

var error = new Error("asd");

describe("Promise.async", function() {
  describe("thenables", function() {
    specify("when they fulfill, the yielded value should be that fulfilled value", function(done){

      Promise.async(eval('(function*(){'+

        'var a = yield get(3);'+
        'assert.equal(a, 3);'+
        'return 4;'+

      '})'))().then(function(arg){
        assert.equal(arg, 4);
      }).then(done, fail(done));

    });


    specify("when they reject, and the generator doesn't have try.caught, it should immediately reject the promise", function(done){

      Promise.async(eval('(function*(){'+
        'var a = yield fail(error);'+
        'assert.fail();'+

      '})'))().then(assert.fail, function(e){
        assert.equal(e, error);
      }).then(done, fail(done));

    });

    specify("when they reject, and the generator has try.caught, it should continue working normally", function(done){

      Promise.async(eval('(function*(){'+
        'try {'+
        '  var a = yield fail(error);'+
        '} catch(e) {'+
        '  return e;'+
        '}'+
        'assert.fail();'+
      '})'))().then(function(v){
        assert.equal(v, error);
      }).then(done, fail(done));

    });

    specify("when they fulfill but then throw, it should become rejection", function(done){

      Promise.async(eval('(function*(){'+
        'var a = yield get(3);'+
        'assert.equal(a, 3);'+
        'throw error;'+
      '})'))().then(assert.fail, function(e){
        assert.equal(e, error);
      }).then(done, fail(done));
    });
  });

  describe("yield loop", function(){

    specify("should work", function(done){
      Promise.async(eval('(function*() {'+
        'var a = [1,2,3,4,5];'+

        'for( var i = 0, len = a.length; i < len; ++i ) {'+
        '  a[i] = yield get(a[i] * 2);'+
        '}'+

        'return a;'+
      '})'))().then(function(arr){
        assert.deepEqual([2,4,6,8,10], arr);
      }).then(done, fail(done));
    });

    specify("inside yield should work", function(done){
      Promise.async(eval('(function*() {'+
        'var a = [1,2,3,4,5];'+

        'return yield Promise.all(a.map(function(v){'+
        '  return Promise.async(function *() {'+
        '    return yield get(v*2);'+
        '  })();'+
        '}));'+
      '})'))().then(function(arr){
        assert.deepEqual([2,4,6,8,10], arr);
      }).then(done, fail(done));
    });

    specify("with simple map should work", function(done){
      Promise.async(eval('(function*() {'+
        'var a = [1,2,3,4,5];'+

        'return yield Promise.map(a, function(v){'+
        '  return Promise.resolve(get(v*2));'+
        '});'+
      '})'))().then(function(arr){
        assert.deepEqual([2,4,6,8,10], arr);
      }).then(done, fail(done));
    });

  });

  describe("when using async as a method", function(){

    function MyClass() {
      this.goblins = 3;
    }

    MyClass.prototype.spawnGoblins = Promise.async(eval('(function*(){'+
    '  this.goblins = yield get(this.goblins+1);'+
    '})'));


    specify("generator function's receiver should be the instance too", function( done ) {
      var a = new MyClass();
      var b = new MyClass();

      Promise.join(a.spawnGoblins().then(function(){
        return a.spawnGoblins();
      }), b.spawnGoblins()).then(function(){
        assert.equal(a.goblins, 5);
        assert.equal(b.goblins, 4);
      }).then(done, fail(done));

    });
  });
});
