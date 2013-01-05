var assert     = require('assert');
var jsdom      = require('jsdom');
var viewbridge = require('../lib/index');
var engines    = require('../lib/engines');

var hasOwn = Object.prototype.hasOwnProperty;


describe('ENGINE Settings', function() {
  it('should have a `name` property', function() {
    engines.each(function(engine) {
      assert.equal(typeof engine.name, 'string');
    });
  });

  it('should have a `ext` property', function() {
    engines.each(function(engine) {
      assert.equal(typeof engine.ext, 'string');
      assert.ok(/^\.[a-z0-9]+/i.test(engine.ext));
    });
  });

  it('should have a `attrRegex` property', function() {
    engines.each(function(engine) {
      assert.ok(engine.attrRegex instanceof RegExp);
    });
  });

  it('should have a `compileConfig` property', function() {
    engines.each(function(engine) {
      assert.equal(hasOwn.call(engine, 'compileConfig'), true);
    });
  });

  it('should have a `compile` property', function() {
    engines.each(function(engine) {
      assert.equal(typeof engine.compile, 'function');
      assert.equal(engine.compile.length, 1, 'takes 1 argument, the template text');
      var tmplstr = engine.compile('test test');
      assert.equal(typeof tmplstr, 'string', 'returns a string of JS');
    });
  });

  it('should have a `runtime` property', function() {
    engines.each(function(engine) {
      assert.equal(typeof engine.runtime, 'function');
      var js = engine.runtime();
      assert.equal(typeof js, 'string');
    });
  });
});


/*
 * Engine functionality
 *
 * For each engine, create a folder in the root of test named the
 * same as the engine. Within it create a template file with same
 * html output as the others.
 */
engines.each(function(engine) {
  describe(engine.name, function() {
    it('should use the namespaced function without additional `render()` type functions', function(done) {
      viewbridge({engine:engine.name, dir:'test'}, function(err, info) {
        assert.equal(err, null);
        jsdom.env({
          html: '<div id="test"></div>'
        , src: [info.javascript]
        , done: function(err, window) {
            assert.doesNotThrow(function() {
              var test = window.document.getElementById('test');
              test.innerHTML = window.viewbridge[engine.name].index({
                title: 'Hello Jojo', list: ['uno', 'dos']
              });
            }, Error);
            var h1 = window.document.querySelector('h1');
            assert.equal(h1.innerHTML.trim(), 'Hello Jojo');
            done();
          }
        });
      });
    });
  });
});

