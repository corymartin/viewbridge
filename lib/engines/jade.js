var fs     = require('fs');
var path   = require('path');
var jade   = require('jade');


/*
 * File Attribute Regex
 * White space forgiving
 */
// //@viewbridge
// //-@viewbridge
var ATTR = /\/\/-?\s*@\s*viewbridge\s*$/im;

/*
 * Runtime cache
 */
var runtime;


module.exports = {
  name:          'jade',
  ext:           '.jade',
  attrRegex:     ATTR,
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
    if (runtime) return runtime;
    var dir       = path.dirname(require.resolve('jade'));
    var runtimejs = path.join(dir, 'runtime.js');
    return runtime = fs.readFileSync(runtimejs, 'utf8');
  },
};

