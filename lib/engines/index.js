var fs     = require('fs');
var path   = require('path');
var jade   = require('jade');
var hogan  = require('hogan.js');
var ejs    = require('ejs');


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
const ENGINE = {};
exports.ENGINE = ENGINE;


/*
 * Jade
 */
var jadeRuntime;

ENGINE.jade = {
  name:          'jade',
  ext:           '.jade',
  attrRegex:     JADE_ATTR,
  compileOptions: {client: true, compileDebug: false},
  addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.client = true;
  },
  compile: function(tmpltext) {
    return jade.compile(tmpltext, this.compileOptions).toString();
  },
  get runtime() {
    if (jadeRuntime) return jadeRuntime;
    var dir       = path.dirname(require.resolve('jade'));
    var runtimejs = path.join(dir, 'runtime.js');
    return jadeRuntime = fs.readFileSync(runtimejs, 'utf8');
  },
};


/*
 * Hogan (Mustache compiler)
 */
var hoganRuntime;

ENGINE.hogan = {
  name:          'hogan',
  ext:           '.html',
  attrRegex:     HOGAN_ATTR,
  compileOptions: {asString: true},
  addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.asString = true;
  },
  _fnTemplate: function() {
    return [
      'function() {'
    , '  var t = new Hogan.Template( {{fnstring}} );'
    , '  return function(data, partial) {'
    , '    return t.render(data, partial);'
    , '  };'
    , '}();'
    ].join('\n');
  }(),
  compile: function(tmpltext) {
    var fnstring = hogan.compile(tmpltext, this.compileOptions);
    return this._fnTemplate.replace('{{fnstring}}', fnstring);
  },
  get runtime() {
    if (hoganRuntime) return hoganRuntime;
    var dir       = path.dirname(require.resolve('hogan.js'));
    var runtimejs = path.join(dir, 'template.js');
    return hoganRuntime = fs.readFileSync(runtimejs, 'utf8');
  },
};


/*
 * EJS
 */
var ejsRuntime;

ENGINE.ejs = {
  name:          'ejs',
  ext:           '.ejs',
  attrRegex:     EJS_ATTR,
  compileOptions: {client: true, compileDebug: false},
  addCompileOptions: function(options) {
    if (!options) return;
    this.compileOptions = options;
    this.compileOptions.client = true;
  },
  compile: function(tmpltext) {
    return ejs.compile(tmpltext, this.compileOptions).toString();
  },
  get runtime() {
    if (ejsRuntime) return ejsRuntime;
    var dir       = path.dirname(require.resolve('ejs'));
    var runtimejs = path.join(dir, '../ejs.js');
    return ejsRuntime = fs.readFileSync(runtimejs, 'utf8');
  },
};

