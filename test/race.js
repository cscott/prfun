"use strict";

var assert = require("assert");
require('../')();

Promise.prototype.caught = function(ty, handle) {
  return this.then(undefined, function(r) {
    if (r instanceof ty) { return handle(r); }
    throw r;
  });
};
var adapter = Promise;
var fulfilled = Promise.resolve.bind(Promise);
var rejected = Promise.reject.bind(Promise);
var pending = function() {
  var o = {};
  o.promise = new Promise(function(fulfill, reject) {
    o.fulfill = fulfill;
    o.reject = reject;
  });
  return o;
};

function fail(done) {
  return function(e) { done(e); };
}

describe("Promise.race", function(){

  it("remains forever pending when passed an empty array", function (done) {
    var p = Promise.race([]);
    var pending = true;
    var cb = function() {
      pending = false;
      throw new Error('should not reach here');
    };

    p.then(cb, cb).then(done, fail(done));

    setTimeout(function() {
      assert(pending);
      done();
    }, 100);
  });

  it("remains forever pending when passed a promise of an empty array", function (done) {
    var p = fulfilled([]).race();
    var pending = true;
    var cb = function() {
      pending = false;
      throw new Error('should not reach here');
    };

    p.then(cb, cb).then(done, fail(done));

    setTimeout(function() {
      assert(pending);
      done();
    }, 100);
  });

  it("fulfills when passed an immediate value", function (done) {
    Promise.race([1,2,3]).then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("fulfills when passed a promise of an immediate value", function (done) {
    fulfilled([1,2,3]).race().then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("fulfills when passed an immediately fulfilled value", function (done) {
    var d1 = pending();
    d1.fulfill(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.fulfill(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.fulfill(3);
    var p3 = d3.promise;

    Promise.race([p1, p2, p3]).then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("fulfills when passed a promise of an immediately fulfilled value", function (done) {
    var d1 = pending();
    d1.fulfill(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.fulfill(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.fulfill(3);
    var p3 = d3.promise;

    fulfilled([p1, p2, p3]).race().then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("fulfills when passed an eventually fulfilled value", function (done) {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    Promise.race([p1, p2, p3]).then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));

    setTimeout(function(){
      d1.fulfill(1);
      d2.fulfill(2);
      d3.fulfill(3);
    }, 13);
  });

  it("fulfills when passed a promise of an eventually fulfilled value", function (done) {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    fulfilled([p1, p2, p3]).race().then(function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));

    setTimeout(function(){
      d1.fulfill(1);
      d2.fulfill(2);
      d3.fulfill(3);
    }, 13);
  });

  it("rejects when passed an immediate value", function (done) {
    Promise.race([rejected(1), 2, 3]).then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("rejects when passed a promise of an immediate value", function (done) {
    fulfilled([rejected(1), 2, 3]).race().then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("rejects when passed an immediately rejected value", function (done) {
    var d1 = pending();
    d1.reject(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.fulfill(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.fulfill(3);
    var p3 = d3.promise;

    Promise.race([p1, p2, , ,  p3]).then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("rejects when passed a promise of an immediately rejected value", function (done) {
    var d1 = pending();
    d1.reject(1);
    var p1 = d1.promise;

    var d2 = pending();
    d2.fulfill(2);
    var p2 = d2.promise;

    var d3 = pending();
    d3.fulfill(3);
    var p3 = d3.promise;

    fulfilled([p1, p2, , ,  p3]).race().then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));
  });

  it("rejects when passed an eventually rejected value", function (done) {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    Promise.race([p1, p2, p3]).then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));

    setTimeout(function(){
      d1.reject(1);
      d2.fulfill(2);
      d3.fulfill(3);
    }, 13);
  });

  it("rejects when passed a promise of an eventually rejected value", function (done) {
    var d1 = pending();
    var p1 = d1.promise;

    var d2 = pending();
    var p2 = d2.promise;

    var d3 = pending();
    var p3 = d3.promise;

    fulfilled([p1, p2, p3]).race().then(assert.fail, function(v){
      assert.deepEqual(v, 1);
    }).then(done, fail(done));

    setTimeout(function(){
      d1.reject(1);
      d2.fulfill(2);
      d3.fulfill(3);
    }, 13);
  });

  it("rejects when passed a rejected promise", function(done) {
    rejected([]).race().then(assert.fail, function(v) {
      assert.deepEqual(v, []);
    }).then(done, fail(done));
  });
});
