var fs     = require('fs');
var jade   = require('jade');
var hogan  = require('hogan.js');

/*
 * Engine Specific Settings/Helpers
 */


/*
 * File Attribue Regexes
 */
// //@ viewbridge
// //-@ viewbridge
JADE_ATTR = /\/\/-?\s*@\s*viewbridge/i;

// {{!@ viewbridge }}
HOGAN_ATTR = /\{\{!\s*@\s*viewbridge\s*\}\}/i



/*
 * Export
 */
var ENGINES = module.exports = {};


/*
 * Jade
 */
ENGINES.jade = {
  ext:       '.jade'
, attrRegex: JADE_ATTR
, compileConfig: {client: true, compileDebug: false}
, compile:   function(tmpltext) {
    return jade.compile(tmpltext, this.compileConfig);
  }
, runtime: function() {
    if (this.runtime.cache) return this.runtime.cache;
    return this.runtime.cache = fs.readFileSync('node_modules/jade/runtime.js', 'utf8');
  }
};


/*
 * Hogan
 */
ENGINES.hogan = {
  ext:       '.hjs'
, attrRegex: HOGAN_ATTR
, compileConfig : {asString: true}
, compile:   function(tmpltext) {
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
    return this.runtime.cache = fs.readFileSync('node_modules/hogan.js/web/builds/2.0.0/template-2.0.0.js', 'utf8');
  }
};


