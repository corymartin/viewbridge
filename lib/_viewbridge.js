var path   = require('path');
var fs     = require('fs');
var async  = require('async');
var jade   = require('jade');
var wrench = require('wrench');

var reduceNamespaces = require('./utils').reduceNamespaces;
var unique           = require('./utils').unique;


/*
 * Settings
 */
var defaultNamespace  = 'viewbridge.templates';
var jadeCompileConfig = {client: true, compileDebug: false};

// //- != viewbridge
// // != viewbridge
JADE_MARKER = /\/\/-?\s*!=\s*viewbridge/i;


/*
 * Jade runtime
 */
var jadeRuntime = fs.readFileSync('node_modules/jade/runtime.js', 'utf8');
// Avoids making `jade` a global.
if (/^\s*jade\s*=/.test(jadeRuntime)) {
  jadeRuntime = 'var ' + jadeRuntime.trim();
}


/*
 * Export
 */
exports.Viewbridge = Viewbridge;


/**
 * @constructor
 * @param {Object} config
 *    - dir:       Path to root of views directory. Required.
 *    - views:     Views to create functions for.
 *    - output:    Filename/path to output templates JS file.
 *    - namespace: Client-side namespace to which views will attach.
 *                 Default is `viewbridge.templates`.
 * @api private
 */
function Viewbridge(config) {
  if (!(this instanceof Viewbridge)) {
    return new Viewbridge(config)
  }
  this._setConfig(config);
  this.buffer = [];
};


Viewbridge.prototype = {
  /**
   * Remove `window` from namespace, if present.
   * Map views to have name and file path props.
   */
  _setConfig: function(config) {
    this.config = this.config || {};
    this.config.dir       = config.dir;
    this.config.views     = config.views || [];
    this.config.output    = config.output;
    this.config.namespace = config.namespace
      ? config.namespace.replace(/^(window\.)|\s+/gi, '')
      : defaultNamespace;
  }

, _mapViews: function() {
    var self = this;
    this.config.views = unique(this.config.views);
    this.config.views = this.config.views.map(function(view) {
      return {
        name: view.replace(/\//g, '.') // function namespace
      , path: path.join(self.config.dir, view.replace(/\//g, path.sep)) + '.jade'
      };
    });
  }

, _getTemplateFiles: function(callback) {
    var templates = [];
    wrench.readdirRecursive(this.config.dir, function(err, files) {
      if (err) return callback(err);
      if (files == null) return callback(null, templates); // done!
      if (!files.length) return;
      files = files.map(function(file) {
        return path.join(this.config.dir, file);
      }.bind(this));
      files.forEach(function(file) {
        if (path.extname(file).toLowerCase() !== '.jade') return;
        if (fs.statSync(file).isDirectory()) return;
        templates.push(file);
      });
    }.bind(this));
  }

, _parseTemplatesForMarkers: function(callback) {
    this._getTemplateFiles(function(err, files) {
      async.forEach(
        files
      , function(file, done) {
          fs.readFile(file, 'utf8', function(err, tmpltext) {
            if (err) done(err);
            if (JADE_MARKER.test(tmpltext)) {
              var view = path.relative(this.config.dir, file);
              view = view.replace(path.extname(view), '');
              this.config.views.push(view);
            }
            done(null);
          }.bind(this));
        }.bind(this)
      , function(err) {
          callback(err);
        }
      );
    }.bind(this));
  }

, _: function() {
    self._parseTemplatesForMarkers(function(err) {
      if (err) return done(err);
      self._mapViews();
      done(null);
    });
  }

  /**
   * Adds a block comment to buffer
   * @param {String} One or more messages
   */
, comment: function() {
    this.buffer.push('/*');
    for (var i = 0; i < arguments.length; i++) {
      this.buffer.push(' * ' + arguments[i]);
    }
    this.buffer.push(' */');
    return this;
  }

, intro: function() {
    this.comment(
      'Viewbridge'
    , '=========='
    , 'Template functions exported via Viewbridge'
    , 'github.com/corymartin/viewbridge'
    );
    this.buffer.push(';(function(window, undefined) {');
    return this;
  }

, outro: function() {
    this.buffer.push('})(this);');
    return this;
  }

  /**
   * Adds the template runtime to the buffer
   */
, runtime: function() {
    this.comment(
      'Jade runtime'
    , '============'
    );
    this.buffer.push(jadeRuntime);
    return this;
  }

  /**
   * string array of all namespaces needed client side
   */
, get _namespaces() {
    var namespaces = [this.config.namespace];
    this.config.views.forEach(function(view) {
      var ns = view.name.split('.');
      if (ns.length === 1) return; // jade templates in root of view dir
      ns.pop();
      namespaces.push(this.config.namespace + '.' + ns.join('.'));
    }.bind(this));
    return reduceNamespaces(namespaces).map(function(ns) {
      return "'" + ns + "'";
    });
  }

  /**
   * Adds JS to buffer that will check for and create namespaces clientside
   */
, namespaces: function() {
    this.comment(
      'Namespaces'
    , '----------'
    );
    this.buffer.push(
      'var createNamespace = ' + client.createNamespace.toString()
    , 'var namespaces = [' + this._namespaces.join(',') + '];'
    , 'for (var i = 0; i < namespaces.length; i++) {'
    , '  createNamespace(namespaces[i]);'
    , '}'
    );
    return this;
  }

  /**
   * Reads/compiles views into JS functions, then adds them to buffer
   */
, templates: function(callback) {
    this.comment(
      'Template Functions'
    , '------------------'
    );
    async.forEach(
      this.config.views
    , function(view, done) {
        fs.readFile(view.path, 'utf8', function(err, tmpltext) {
          if (err) done(err);
          var fn   = jade.compile(tmpltext, jadeCompileConfig);
          var name = this.config.namespace + '.' + view.name;
          this.comment('Template: ' + name + '()');
          this.buffer.push(name + ' = ' + fn.toString());
          done(null);
        }.bind(this));
      }.bind(this)
    , function(err) {
        callback(err);
      }
    );
    return this;
  }

  /**
   * Adds JS to buffer that will enable AMD support clientside
   */
, amd: function() {
    this.comment(
      'AMD/RequireJS Support'
    , '---------------------'
    );
    this.buffer.push(
      'if (typeof define === \'function\' && define.amd) {'
    , '  define(function() {'
    , '    return ' + this.config.namespace + ';'
    , '  });'
    , '}'
    );
    return this;
  }

  /**
   * Call all buffer helpers in order to build clientside JS
   */
, assemble: function(callback) {
    var self = this;
    async.series(
      [
        function(done) {
          self._parseTemplatesForMarkers(function(err) {
            if (err) return done(err);
            self._mapViews();
            done(null);
          });
        }
      , function(done) {
          self.intro();
          self.runtime();
          self.namespaces();
          done(null);
        }
      , function(done) {
          self.templates(done);
        }
      , function(done) {
          self.amd();
          self.outro();
          done(null);
        }
      ]
    , callback
    );
    return this;
  }

, get javascript() {
    return this.buffer.join('\n');
  }

, get info() {
    var self = this;
    return {
      file:       self.config.output
    , javascript: self.javascript
    };
  }

, generate: function(callback) {
    callback = callback || function(){};
    this.assemble(function(err) {
      if (err) {
        callback(err);
        return;
      }
      if (this.config.output) {
        this.save(callback);
        return;
      }
      callback(null, this.info);
    }.bind(this));
  }

, save: function(callback) {
    fs.writeFile(this.config.output, this.javascript, 'utf8', function(err) {
      callback(err, this.info);
    }.bind(this));
  }
};


/**
 * JS functions that will be inserted into client js (via toString())
 */
var client = {};
client.createNamespace = function(ns_string) {
  // Adapted from JavaScript Patterns by Stoyan Stefanov
  var parts = ns_string.split('.');
  var parent = window;
  for (var i = 0; i < parts.length; i++) {
    if (parent[parts[i]] == null) {
      parent[parts[i]] = {};
    }
    parent = parent[parts[i]];
  }
};

