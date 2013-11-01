var fs     = require('fs');
var path   = require('path');
var hogan  = require('hogan.js');


/*
 * File Attribute Regex
 * White space forgiving
 */
// {{! @viewbridge }}
// {{!
//   @viewbridge
// }}
var ATTR = /\{\{!\s*@\s*viewbridge\s*\}\}/i;


/*
 * Runtime cache
 */
var runtime;


module.exports = {
  name:          'hogan',
  ext:           '.html',
  attrRegex:     ATTR,
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
    if (runtime) return runtime;
    var dir       = path.dirname(require.resolve('hogan.js'));
    var runtimejs = path.join(dir, 'template.js');
    return runtime = fs.readFileSync(runtimejs, 'utf8');
  },
};

