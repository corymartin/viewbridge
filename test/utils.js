var assert = require('assert');

var reduceNamespaces = require('../lib/utils').reduceNamespaces;


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

