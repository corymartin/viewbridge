var fs     = require('fs');
var path   = require('path');
var ejs    = require('ejs');


/*
 * File Attribute Regexes
 * White space forgiving
 */
// <%/* @viewbridge */%>
// <%
//   //@viewbridge
// %>
var ATTR = /<%\s*(\/\*|\/\/)\s*@\s*viewbridge\s*(\*\/\s*)?%>/i


/*
 * Runtime cache
 */
var runtime;


module.exports = {
  name:          'ejs',
  ext:           '.ejs',
  attrRegex:     ATTR,
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
    if (runtime) return runtime;
    var dir       = path.dirname(require.resolve('ejs'));
    var runtimejs = path.join(dir, '../ejs.js');
    return runtime = fs.readFileSync(runtimejs, 'utf8');
  },
};

