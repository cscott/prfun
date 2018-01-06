'use strict';

var assert = require('assert');
var Promise = require('../');

function promised(val) {
  return Promise.delay(val, 4);
}

function thenabled(val) {
  return {
    then: function(f) {
      setTimeout(function() {
        f(val);
      }, 4);
    },
  };
}

describe('Promise.prototype.reduce', function() {


  it('should allow returning values', function() {
    var a = [promised(1), promised(2), promised(3)];

    return Promise.reduce(a, function(total, a) {
      return total + a + 5;
    }, 0).then(function(total) {
      assert.equal(total, 1 + 5 + 2 + 5 + 3 + 5);
    });
  });

  it('should allow returning promises', function() {
    var a = [promised(1), promised(2), promised(3)];

    return Promise.reduce(a, function(total, a) {
      return promised(5).then(function(b) {
        return total + a + b;
      });
    }, 0).then(function(total) {
      assert.equal(total, 1 + 5 + 2 + 5 + 3 + 5);
    });
  });

  it('should allow returning thenables', function() {
    var b = [1, 2, 3];
    var a = [];

    return Promise.reduce(b, function(total, cur) {
      a.push(cur);
      return thenabled(3);
    }, 0).then(function(total) {
      assert.equal(total, 3);
      assert.deepEqual(a, b);
    });
  });

  it('propagates error', function() {
    var a = [promised(1), promised(2), promised(3)];
    var e = new Error('asd');
    return Promise.reduce(a, function(total, a) {
      if (a > 2) {
        throw e;
      }
      return total + a + 5;
    }, 0).then(assert.fail, function(err) {
      assert.equal(err, e);
    });
  });
});

describe('Promise.prototype.reduceRight', function() {


  it('should allow returning values', function() {
    var a = [promised(1), promised(2), promised(3)];

    return Promise.reduceRight(a, function(total, a) {
      return total + a + 5;
    }, 0).then(function(total) {
      assert.equal(total, 1 + 5 + 2 + 5 + 3 + 5);
    });
  });

  it('should allow returning promises', function() {
    var a = [promised(1), promised(2), promised(3)];

    return Promise.reduceRight(a, function(total, a) {
      return promised(5).then(function(b) {
        return total + a + b;
      });
    }, 0).then(function(total) {
      assert.equal(total, 1 + 5 + 2 + 5 + 3 + 5);
    });
  });

  it('should allow returning thenables', function() {
    var b = [1, 2, 3];
    var a = [];
    var br = [3, 2, 1];

    return Promise.reduceRight(b, function(total, cur) {
      a.push(cur);
      return thenabled(3);
    }, 0).then(function(total) {
      assert.equal(total, 3);
      assert.deepEqual(a, br);
    });
  });

  it('propagates error', function() {
    var a = [promised(1), promised(2), promised(3)];
    var e = new Error('asd');
    return Promise.reduceRight(a, function(total, a) {
      if (a > 2) {
        throw e;
      }
      return total + a + 5;
    }, 0).then(assert.fail, function(err) {
      assert.equal(err, e);
    });
  });
});
