var assert     = require('assert');
var exec       = require('child_process').exec;
var fs         = require('fs');
var path       = require('path');
var jsdom      = require('jsdom');


var viewsdir  = path.join(__dirname, 'views');
var deploydir = path.join(__dirname, 'deploy');
var watchdir  = path.join(__dirname, 'watch');
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
  var deploy = fs.readdirSync(deploydir);
  deploy.forEach(function(file) {
    fs.unlinkSync( path.join(deploydir, file) );
  });

  var watch = fs.readdirSync(watchdir);
  watch.forEach(function(file) {
    fs.unlinkSync( path.join(watchdir, file) );
  });
});


describe('Config file option', function() {
  it('should use it if it exists and no args passed', function(done) {
    //TODO: This wasn't working in beforeEach/afterEach
    process.chdir('test');
    exec('../bin/viewbridge', function(err, stdout, stderr) {
      jsdom.env(html, [stdout.trim()], function(err, window) {
        assert.ok(window.fizz);
        assert.ok(window.fizz.buzz);
        assert.equal(typeof window.fizz.buzz.index, 'function');

        window.document.body.innerHTML =
          window.fizz.buzz.index({title:'Config Test', list:[
            'foo', 'bar', 'baz'
          ]});
        var h1 = window.document.querySelector('h1');
        var h2 = window.document.querySelector('h2');

        assert.equal(h1.innerHTML, 'Config Test');
        assert.equal(h2.innerHTML, 'index.hjs');
        //TODO: This wasn't working in beforeEach/afterEach
        process.chdir('..');
        done();
      });
    });
  });
});
