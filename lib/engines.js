var fs     = require('fs');
var path   = require('path');
var jade   = require('jade');
var hogan  = require('hogan.js');
var ejs    = require('ejs');
var _      = require('underscore');


/*
 * File Attribute Regexes
 *
 * Whitespace flexible with the '@' and 'viewbridge'
 * Eg, '@viewbridge', '@ viewbridge', multiline(eg, mustache), etc
 */
// //@ viewbridge
// //-@ viewbridge
const JADE_ATTR = /\/\/-?\s*@\s*viewbridge\s*$/im;

// {{!@ viewbridge }}
// {{!
//   @viewbridge
// }}
const HOGAN_ATTR = /\{\{!\s*@\s*viewbridge\s*\}\}/i

// <%/* @ viewbridge */%>
// <%
//   //@ viewbridge
// %>
const EJS_ATTR = /<%\s*(\/\*|\/\/)\s*@\s*viewbridge\s*(\*\/\s*)?%>/i



/*
 * Utils
 */
exports.isSupported = function(name) {
  return !!~Object.keys(ENGINE).indexOf(name.toLowerCase());
};

exports.each = function(cb) {
  for (var eng in ENGINE) {
    cb(ENGINE[eng]);
  }
};


/*
 * Engine Specific Configs/Settings
 */
const ENGINE = {}
exports.ENGINE = ENGINE;

/*
 * Jade
 */
ENGINE.jade = {
  name:          'jade'
, ext:           '.jade'
, attrRegex:     JADE_ATTR
, compileOptions: {client: true, compileDebug: false}
, addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.client = true;
  }
, compile: function(tmpltext) {
    return jade.compile(tmpltext, this.compileOptions).toString();
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    var dir       = path.dirname(require.resolve('jade'));
    var runtimejs = path.join(dir, 'runtime.js');
    return this.runtime.cache = fs.readFileSync(runtimejs, 'utf8');
  }
};

/*
 * Hogan (Mustache compiler)
 */
ENGINE.hogan = {
  name:          'hogan'
, ext:           '.html'
, attrRegex:     HOGAN_ATTR
, compileOptions: {asString: true}
, addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.asString = true;
  }
, _fnTemplate: (function() {
    return [
      'function() {'
    , '  var t = new Hogan.Template( {{fnstring}} );'
    , '  return function(data, partial) {'
    , '    return t.render(data, partial);'
    , '  };'
    , '}();'
    ].join('\n');
  })()
, compile: function(tmpltext) {
    var fnstring = hogan.compile(tmpltext, this.compileOptions);
    return this._fnTemplate.replace('{{fnstring}}', fnstring);
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    var dir       = path.dirname(require.resolve('hogan.js'));
    var runtimejs = path.join(dir, 'template.js');
    return this.runtime.cache = fs.readFileSync(runtimejs, 'utf8');
  }
};

/*
 * EJS
 */
ENGINE.ejs = {
  name:          'ejs'
, ext:           '.ejs'
, attrRegex:     EJS_ATTR
, compileOptions: {client: true, compileDebug: false}
, addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.client = true;
  }
, compile: function(tmpltext) {
    return ejs.compile(tmpltext, this.compileOptions).toString();
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    var dir       = path.dirname(require.resolve('ejs'));
    var runtimejs = path.join(dir, '../ejs.js');
    return this.runtime.cache = fs.readFileSync(runtimejs, 'utf8');
  }
};

/*
 * Underscore
 */
ENGINE.underscore = {
  name:          'underscore'
, ext:           '.html'
, attrRegex:     EJS_ATTR
, compileOptions: _.templateSettings
, addCompileOptions: function(options) {
    if (!options) return;
    for (var key in options) {
      _.templateSettings[key] = options[key];
    }
  }
, compile: function(tmpltext) {
    return _.template(tmpltext).source;
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    var dir       = path.dirname(require.resolve('underscore'));
    var runtimejs = path.join(dir, './underscore.js');
    return this.runtime.cache = fs.readFileSync(runtimejs, 'utf8');
  }
};

