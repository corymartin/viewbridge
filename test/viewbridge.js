var assert     = require('assert');
var fs         = require('fs');
var path       = require('path');
var jsdom      = require('jsdom');
var viewbridge = require('../lib/viewbridge');


var viewsdir  = path.join(__dirname, 'views');
var deploydir = path.join(__dirname, 'deploy');

var options01;
var html = [
  '<div>'
, ' <div id="about"/>'
, ' <div id="status-index"/>'
, ' <div id="status-time"/>'
, '</div>'
].join('\n');


/*
 * beforeEach
 */
beforeEach(function() {
  options01 = {
    dir:       viewsdir
  , views:     ['about', 'status/index', 'status/time']
  , output:    path.join(deploydir, 'tmpl01.js')
  , namespace: 'APP.T'
  };
});

/*
 * afterEach
 */
afterEach(function() {
  // Remove deploy files
  var files = fs.readdirSync(deploydir);
  files.forEach(function(file) {
    fs.unlinkSync( path.join(deploydir, file) );
  });
});


/*
 * Specs
 */
describe('viewbridge()', function() {
  it('should create the JS file', function(done) {
    viewbridge(options01, function(err, info) {
      assert.ok( fs.existsSync(options01.output) );
      assert.ok( fs.existsSync(info.file) );
      done();
    });
  });
});


describe('JS output file', function() {
  it('should create the root namespace', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.doesNotThrow(function() {
          if (!window.APP.T) throw new Error;
        }, Error);
        assert.equal(typeof window.APP.T, 'object');
        done();
      });
    });
  });

  it('should have a template function for each view requested', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.doesNotThrow(function() {
          if ( !window.APP.T.about
            || !window.APP.T.status.index
            || !window.APP.T.status.time) {
            throw new Error;
          }
        }, Error);
        assert.equal(typeof window.APP.T.about,        'function');
        assert.equal(typeof window.APP.T.status.index, 'function');
        assert.equal(typeof window.APP.T.status.time,  'function');
        done();
      });
    });
  });
});


describe('Template function', function() {
  it('should work with passed data', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        var doc = window.document;
        var statusIndex = doc.getElementById('status-index');
        statusIndex.innerHTML = window.APP.T.status.index({
          title: 'Mr. Test'
        , stats: ['awesome', 'super', 'fantastic']
        });

        var h1 = statusIndex.querySelector('h1');
        assert.equal(h1.innerHTML, 'Mr. Test');

        var lis = statusIndex.querySelectorAll('li');
        assert.equal(lis.length, 3);
        assert.equal(lis[0].innerHTML, 'awesome');
        assert.equal(lis[1].innerHTML, 'super');
        assert.equal(lis[2].innerHTML, 'fantastic');
        done();
      });
    });
  });

  it('should work with mixins', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        var doc = window.document;
        var about = doc.getElementById('about');
        about.innerHTML = window.APP.T.about();

        var list = about.querySelector('ol.items')
        assert.equal(list.className, 'items');

        var lis = list.getElementsByTagName('li');
        assert.equal(lis.length, 3);
        assert.equal(lis[0].innerHTML, 'milk');
        assert.equal(lis[1].innerHTML, 'sugar');
        assert.equal(lis[2].innerHTML, 'bread');
        done();
      });
    });
  });

});

