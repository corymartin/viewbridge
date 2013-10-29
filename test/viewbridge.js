//TODO: This is sloppy

var assert     = require('assert');
var fs         = require('fs');
var path       = require('path');
var jsdom      = require('jsdom');
var viewbridge = require('../lib/index');


var viewsdir  = path.join(__dirname, 'views');
var deploydir = path.join(__dirname, 'deploy');
var htmldir   = path.join(__dirname, 'html');
var jadedir   = path.join(__dirname, 'jade');
var hogandir  = path.join(__dirname, 'hogan');

var html = fs.readFileSync(path.join(htmldir, 'viewbridge.html'), 'utf8');

var baseTest = function(done) {
  return function(err, info) {
    assert.equal(info.stats.templateCount, 1);
    assert.equal(info.stats.templates[0], 'viewbridge.index');
    jsdom.env('<div id=foo></div>', [info.file], function(err, window) {
      var doc = window.document;
      assert.ok(!!window.viewbridge, 'root namespace should be defined');
      assert.ok(!!window.viewbridge.index);
      assert.equal(typeof window.viewbridge.index, 'function');

      var foo = doc.getElementById('foo');
      foo.innerHTML = window.viewbridge.index({
        title: 'Test test'
      , list: ['uno', 'dos', 'tres']
      });
      var h1  = doc.querySelector('h1');
      var lis = doc.querySelectorAll('li');

      assert.equal(h1.innerHTML, 'Test test');
      assert.equal(lis.length, 3);
      assert.equal(lis[0].innerHTML, 'uno');
      assert.equal(lis[1].innerHTML, 'dos');
      assert.equal(lis[2].innerHTML, 'tres');
      done();
    });
  };
};

var namespaceExists = function(context, ns) {
  if (! ns) return false;
  var parent = context;
  var parts = ns.split('.');
  return parts.every(function(part) {
    if (parent[part] == null) return false;
    parent = parent[part];
    return true;
  });
};

var options01;
var options02;
var options03;


/*
 * beforeEach
 */
beforeEach(function() {
  options01 = {
    dir:       viewsdir,
    engine:    'jade',
    views:     ['about', 'status/index', 'status/time'],
    output:    path.join(deploydir, 'tmpl01.js'),
    namespace: 'APP.T',
  };

  options02 = {
    dir:       viewsdir,
    engine:    'jade',
    output:    path.join(deploydir, 'tmpl02.js'),
  };

  options03 = {
    dir:       viewsdir,
    engine:    'jade',
    views:     ['user/index'],
    output:    path.join(deploydir, 'tmpl03.js'),
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
describe('JS output file', function() {
  it('should create the JS file', function(done) {
    viewbridge(options01, function(err, info) {
      assert.equal(info.stats.templateCount, 3);
      assert.ok( fs.existsSync(options01.output) );
      assert.ok( fs.existsSync(info.file) );
      done();
    });
  });

  it('should create the root namespace', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.ok(namespaceExists(window, 'APP.T'), 'Namespace APP.T should exist');
        assert.equal(typeof window.APP.T, 'object');
        done();
      });
    });
  });

  it('should have a template function for each view requested by options', function(done) {
    viewbridge(options01, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.ok(namespaceExists(window, 'APP.T'),        'Namespace APP.T should exist');
        assert.ok(namespaceExists(window, 'APP.T.status'), 'Namespace APP.T.status should exist');
        assert.equal(typeof window.APP.T.about,        'function');
        assert.equal(typeof window.APP.T.status.index, 'function');
        assert.equal(typeof window.APP.T.status.time,  'function');
        done();
      });
    });
  });

  it('should create templates `views` in `dir` if both options are passed', function(done) {
    var options = {
      engine:    'jade',
      dir:       viewsdir,
      views:     ['about'],
      output:    path.join(deploydir, 'tmpl01.js'),
      namespace: 'APP.T',
    };
    viewbridge(options, function(err, info) {
      assert.equal(err, null);
      assert.equal(info.stats.templateCount, 1);
      assert.equal(info.stats.templates[0], 'APP.T.about');
      jsdom.env(html, [info.file], function(err, window) {
        assert.equal(typeof window.APP.T.about, 'function');
        done();
      });
    });
  });

  it('should creates templates specified by `views` option in CWD if `dir` is not passed', function(done) {
    var options = {
      engine:    'jade',
      views:     ['test/views/about'],
      output:    path.join(deploydir, 'tmpl01.js'),
      namespace: 'APP.T',
    };
    viewbridge(options, function(err, info) {
      assert.equal(err, null);
      assert.equal(info.stats.templateCount, 1);
      assert.equal(info.stats.templates[0], 'APP.T.test.views.about');
      jsdom.env(html, [info.file], function(err, window) {
        assert.equal(typeof window.APP.T.test.views.about, 'function');
        done();
      });
    });
  });

  it('should error if the the `engine` option is not passed', function(done) {
    var options = {
    };
    viewbridge(options, function(err, info) {
      assert.notEqual(err, null);
      assert.equal(err.message, 'Engine is required');
      done();
    });
  });

  it('should error on an unknown `engine` option', function(done) {
    var options = {
      engine: 'cheesy_poofs_zzzzzz'
    };
    viewbridge(options, function(err, info) {
      assert.notEqual(err, null);
      assert.equal(err.message, 'Requested engine is not supported');
      done();
    });
  });


  ;[
    'jade',
    'hogan',
    'ejs',
  ].forEach(function(engine) {
    it('should have the `'+engine+'` engine', function(done) {
      var options = {
        engine: engine
      };
      viewbridge(options, function(err, info) {
        assert.equal(err, null);
        done();
      });
    });
  });

  it('should have a template function for each view requested by Viewbridge attributes', function(done) {
    viewbridge(options02, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        assert.equal(info.stats.templateCount, 3);
        assert.ok(namespaceExists(window, 'viewbridge.status'),       'Namespace viewbridge.status should exist');
        assert.ok(namespaceExists(window, 'viewbridge.user'),         'Namespace viewbridge.user should exist');
        assert.ok(namespaceExists(window, 'viewbridge.user.account'), 'Namespace viewbridge.user.account should exist');
        assert.equal(typeof window.viewbridge.status.time,       'function');
        assert.equal(typeof window.viewbridge.user.greeting,     'function');
        assert.equal(typeof window.viewbridge.user.account.info, 'function');
        done();
      });
    });
  });

});


describe('Clientside template functions', function() {
  it('should work with passed data - Test 01', function(done) {
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

  it('should work with passed data - Test 02', function(done) {
    viewbridge(options02, function(err, info) {
      jsdom.env(html, [info.file], function(err, window) {
        var doc = window.document;
        var user = doc.getElementById('user');
        user.innerHTML = window.viewbridge.user.greeting({
          name: 'Leopold the Noodle'
        });

        var h1 = user.querySelector('h1');
        assert.equal(h1.innerHTML, 'Hello Leopold the Noodle!');

        var infoHtml = window.viewbridge.user.account.info({
          list : {
            faves: 7
          , visits: 23
          , projects: 9
          }
        });
        user.innerHTML += infoHtml;

        var lis = user.querySelectorAll('ul li');
        assert.equal(lis.length, 3);
        assert.equal(lis[0].innerHTML, 'faves : 7');
        assert.equal(lis[1].innerHTML, 'visits : 23');
        assert.equal(lis[2].innerHTML, 'projects : 9');
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


describe('Options', function() {
  it('should compile all templates with allviews:true', function(done) {
    var opts = {
      allviews: true
    , dir:      jadedir
    , engine:   'jade'
    , output:   path.join(deploydir, 'tmpl-all-views.js')
    };
    viewbridge(opts, function(err, info) {
      assert.equal(err, null);
      jsdom.env('<div id=foo></div>', [info.file], function(err, window) {
        assert.ok(window.viewbridge);
        assert.equal(Object.keys(window.viewbridge).length, 3);
        assert.equal(typeof window.viewbridge.a,     'function');
        assert.equal(typeof window.viewbridge.b,     'function');
        assert.equal(typeof window.viewbridge.index, 'function');
        done();
      });
    });
  });
});
