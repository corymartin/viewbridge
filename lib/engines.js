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
JADE_ATTR = /\/\/-?\s*@\s*viewbridge\s*$/im;

// {{!@ viewbridge }}
// {{!
//   @viewbridge
// }}
HOGAN_ATTR = /\{\{!\s*@\s*viewbridge\s*\}\}/i

// <%/* @ viewbridge */%>
// <%
//   //@ viewbridge
// %>
EJS_ATTR = /<%\s*(\/\*|\/\/)\s*@\s*viewbridge\s*(\*\/\s*)?%>/i


/*
 * Export
 */
var ENGINES = module.exports = {};


ENGINES.isSupported = function(name) {
  return !!~Object.keys(ENGINES).indexOf(name.toLowerCase())
    && name !== 'isSupported'
    && name !== 'each';
};


/*
 * Jade
 */
ENGINES.jade = {
  name:          'jade'
, ext:           '.jade'
, attrRegex:     JADE_ATTR
, compileConfig: {client: true, compileDebug: false}
, compile: function(tmpltext) {
    return jade.compile(tmpltext, this.compileConfig).toString();
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
ENGINES.hogan = {
  name:          'hogan'
, ext:           '.html'
, attrRegex:     HOGAN_ATTR
, compileConfig: {asString: true}
, compile: function(tmpltext) {
    var fnstring = hogan.compile(tmpltext, this.compileConfig);
    return [
      '(function() {'
    , '  var t = new Hogan.Template(' + fnstring + ');'
    , '  return function(data, partial) {'
    , '    return t.render(data, partial);'
    , '  };'
    , '})();'
    ].join('\n');
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
ENGINES.ejs = {
  name:          'ejs'
, ext:           '.ejs'
, attrRegex:     EJS_ATTR
, compileConfig: {compileDebug: false, client: true}
, compile: function(tmpltext) {
    return ejs.compile(tmpltext, this.compileConfig).toString();
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    var dir       = path.dirname(require.resolve('ejs'));
    var runtimejs = path.join(dir, '../ejs.js');
    return this.runtime.cache = fs.readFileSync(runtimejs, 'utf8');
  }
};

