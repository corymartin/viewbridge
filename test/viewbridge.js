var assert     = require('assert');
var fs         = require('fs');
var path       = require('path');
var jsdom      = require('jsdom');
var viewbridge = require('../lib/viewbridge');


var viewsdir  = path.join(__dirname, 'views');
var deploydir = path.join(__dirname, 'deploy');
var htmldir   = path.join(__dirname, 'html');

var html = fs.readFileSync(path.join(htmldir, 'viewbridge.html'), 'utf8');

var options01;
var options02;
var options03;

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

  options02 = {
    dir:       viewsdir
  , output:    path.join(deploydir, 'tmpl02.js')
  };

  options03 = {
    dir:       viewsdir
  , views:     ['user/index']
  , output:    path.join(deploydir, 'tmpl03.js')
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

  it('should have a template function for each view requested by options', function(done) {
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

  it('should have a template function for each view requested by file markers', function(done) {
    viewbridge(options02, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.equal(info.stats.templateCount, 3);
        assert.doesNotThrow(function() {
          if ( !window.viewbridge.templates.status.time
            || !window.viewbridge.templates.user.greeting
            || !window.viewbridge.templates.user.account.info) {
            throw new Error;
          }
        }, Error);
        assert.equal(typeof window.viewbridge.templates.status.time,       'function');
        assert.equal(typeof window.viewbridge.templates.user.greeting,     'function');
        assert.equal(typeof window.viewbridge.templates.user.account.info, 'function');
        done();
      });
    });
  });

  it('should have a template function for each view requested by options and file markers', function(done) {
    viewbridge(options03, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.equal(info.stats.templateCount, 4);
        assert.doesNotThrow(function() {
          if ( !window.viewbridge.templates.status.time
            || !window.viewbridge.templates.user.greeting
            || !window.viewbridge.templates.user.account.info
            || !window.viewbridge.templates.user.index) {
            throw new Error;
          }
        }, Error);
        assert.equal(typeof window.viewbridge.templates.status.time,       'function');
        assert.equal(typeof window.viewbridge.templates.user.greeting,     'function');
        assert.equal(typeof window.viewbridge.templates.user.account.info, 'function');
        assert.equal(typeof window.viewbridge.templates.user.index,        'function');
        done();
      });
    });
  });
});


describe('Clientside template functions', function() {
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

