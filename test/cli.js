var assert     = require('assert');
var exec       = require('child_process').exec;
var fs         = require('fs');
var path       = require('path');
var jsdom      = require('jsdom');


var viewsdir  = path.join(__dirname, 'views');
var deploydir = path.join(__dirname, 'deploy');
var htmldir   = path.join(__dirname, 'html');
var jadedir   = path.join(__dirname, 'jade');
var hogandir  = path.join(__dirname, 'hogan');

var html = fs.readFileSync(path.join(htmldir, 'viewbridge.html'), 'utf8');

var output = path.join(deploydir, 'cli01.js');

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

describe('STDOUT', function() {
  it('should be the output file path when successful', function(done) {
    exec('bin/viewbridge -e hogan -o ' + output, function(err, stdout, stderr) {
      assert.equal(err, null);
      assert.equal(stdout.trim(), output);
      assert.equal(stderr.trim(), '');
      done();
    });
  });
});


describe('CLI options', function() {
  /*
   * --engine
   */
  var engineTest = function(command, done) {
    exec('bin/viewbridge -d test/hogan -o ' + output, function(err, stdout, stderr) {
      assert.equal(err, null);
      assert.equal(stderr.trim(), 'Error: Required argument missing: engine');

      exec(command, function(err, stdout, stderr) {
        assert.equal(err, null);
        assert.equal(stderr, '');

        jsdom.env(html, [stdout.trim()], function(err, window) {
          assert.ok(!!window.Hogan, 'window.jade should be defined');
          done();
        });
      });
    });
  };

  it('should have a required --engine option', function(done) {
    engineTest('bin/viewbridge --engine hogan -d test/views -o ' + output, done);
  });

  it('should have a -e short option for --engine', function(done) {
    engineTest('bin/viewbridge -e hogan -d test/views -o ' + output, done);
  });

  /*
   * --dir
   */
  var dirTest = function(command, done) {
    exec(command, function(err, stdout, stderr) {
      assert.equal(err, null);
      assert.equal(stderr, '');
      assert.ok(stdout);
      assert.equal(stdout.trim(), output);
      done();
    });
  };

  it('should have a --dir option', function(done) {
    dirTest('bin/viewbridge -e hogan --dir test/hogan -o ' + output, done);
  });

  it('should have a -d short option for --dir', function(done) {
    dirTest('bin/viewbridge -e hogan -d test/hogan -o ' + output, done);
  });

  it('should use pwd if --dir is not passed', function(done) {
    // This will find templates below project root, in tests/ dir
    exec('bin/viewbridge -e hogan -o ' + output, function(err, stdout, stderr) {
      assert.equal(err, null);
      assert.equal(stderr, '');
      assert.ok(stdout);
      assert.equal(stdout.trim(), output);
      jsdom.env(html, [stdout.trim()], function(err, window) {
        assert.ok(window.viewbridge.test);
        done();
      });
    });
  });

  /*
   * --views
   */
  var viewsTest = function(command, done) {
    exec(command, function(err, stdout, stderr) {
      assert.equal(err, null);
      jsdom.env(html, [stdout.trim()], function(err, window) {
        var vb = window.viewbridge;
        assert.equal(typeof vb.test.views.about, 'function');
        assert.equal(typeof vb.test.views.status.time, 'function');
        done();
      });
    });
  };

  it('should have a --views option', function(done) {
    viewsTest('bin/viewbridge --views test/views/about,test/views/status/time -e jade  -o ' + output, done);
  });

  it('should have a -v short option for --views', function(done) {
    viewsTest('bin/viewbridge -v test/views/about,test/views/status/time -e jade  -o ' + output, done);
  });

  /*
   * --output
   */
  var outputTest = function(command, done) {
    assert.ok( ! fs.existsSync(output));
    exec(command, function(err, stdout, stderr) {
      assert.ok(fs.existsSync(output));
      done();
    });
  };

  it('should have a --output option', function(done) {
    outputTest('bin/viewbridge -e jade  --output ' + output, done);
  });

  it('should have a -o short option for --output', function(done) {
    outputTest('bin/viewbridge -e jade  -o ' + output, done);
  });

  /*
   * --namespace
   */
  var namespaceTest = function(command, done) {
    exec(command, function(err, stdout, stderr) {
      assert.equal(err, null);
      jsdom.env(html, [stdout.trim()], function(err, window) {
        assert.ok(window.foo.bar.baz);
        assert.ok( ! window.viewbridge);
        done();
      });
    });
  };

  it('should have a --namespace option', function(done) {
    namespaceTest('bin/viewbridge --namespace foo.bar.baz -e hogan  -o ' + output, done);
  });

  it('should have a -n short option for --namespace', function(done) {
    namespaceTest('bin/viewbridge -n foo.bar.baz -e hogan  -o ' + output, done);
  });

  /*
   * --ext
   */
  var extTest = function(command, done) {
    exec(command, function(err, stdout, stderr) {
      assert.equal(err, null);
      jsdom.env(html, [stdout.trim()], function(err, window) {
        assert.equal(typeof window.viewbridge.index, 'function');

        var user = window.document.getElementById('user');
        user.innerHTML = window.viewbridge.index({
          title: 'Hi there'
        , list: []
        });
        var h2 = user.querySelector('h2');

        assert.equal(h2.innerHTML, 'index.hjs');
        done();
      });
    });
  };

  it('should have a --ext option', function(done) {
    extTest('bin/viewbridge --ext .hjs -d test/hogan -e hogan  -o ' + output, done);
  });

  it('should have a -E short option for --ext', function(done) {
    extTest('bin/viewbridge -E .hjs -d test/hogan -e hogan  -o ' + output, done);
  });

});
