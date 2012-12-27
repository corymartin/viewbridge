var assert = require('assert');

var reduceNamespaces = require('../lib/utils').reduceNamespaces;
var unique           = require('../lib/utils').unique;


describe('reduceNamespaces()', function() {
  it('should high level namespaces found in other namespaces', function() {
    var ns = ['a.b', 'a', 'a.b.c.d', 'a.b', 'b', 'a.b.z']
    ns = reduceNamespaces(ns);
    assert.equal(ns.length, 3);
    assert.ok(!!~ns.indexOf('a.b.c.d'));
    assert.ok(!!~ns.indexOf('a.b.z'));
    assert.ok(!!~ns.indexOf('b'));
  });
});


describe('unique()', function() {
  it('should return a new array with duplicates removed from original', function() {
    var a = ['foo', 'bar', 'zzz', 'bar', 'buz', 'foo', 'foo', 'zzz'];
    var u = unique(a);
    assert.equal(u.length, 4);
    assert.ok(!!~u.indexOf('foo'));
    assert.ok(!!~u.indexOf('bar'));
    assert.ok(!!~u.indexOf('zzz'));
    assert.ok(!!~u.indexOf('buz'));
  });
});
