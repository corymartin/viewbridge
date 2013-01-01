var assert  = require('assert');
var ENGINES = require('../lib/engines');

var hasOwn = Object.prototype.hasOwnProperty;

function eachEngine(fn) {
  for (var key in ENGINES) {
    if (key === 'isSupported') continue;
    fn(ENGINES[key]);
  }
};


describe('ENGINES Settings', function() {
  it('should have a `ext` property', function() {
    eachEngine(function(engine) {
      assert.equal(typeof engine.ext, 'string');
      assert.ok(/^\.[a-z0-9]+/i.test(engine.ext));
    });
  });

  it('should have a `attrRegex` property', function() {
    eachEngine(function(engine) {
      assert.ok(engine.attrRegex instanceof RegExp);
    });
  });

  it('should have a `compileConfig` property', function() {
    eachEngine(function(engine) {
      assert.equal(hasOwn.call(engine, 'compileConfig'), true);
    });
  });

  it('should have a `compile` property', function() {
    eachEngine(function(engine) {
      assert.equal(typeof engine.compile, 'function');
      assert.equal(engine.compile.length, 1, 'takes 1 argument, the template text');
      var tmplstr = engine.compile('test test');
      assert.equal(typeof tmplstr, 'string', 'returns a string of JS');
    });
  });

  it('should have a `runtime` property', function() {
    eachEngine(function(engine) {
      assert.equal(typeof engine.runtime, 'function');
      var js = engine.runtime();
      assert.equal(typeof js, 'string');
    });
  });
});

