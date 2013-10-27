var Viewbridge = require('./viewbridge').Viewbridge;
var ENGINES    = require('./engines');


/**
 * @param {Object} config Same as Viewbridge constructor.
 * @param {Function} callback Called when complete.
 */
module.exports = function(config, callback) {
  // Engine is required
  if (!config.engine) {
    if (callback) callback(new Error('Engine is required'));
    return;
  }
  else {
    if (!ENGINES.isSupported(config.engine)) {
      if (callback) callback(new Error('Requested engine is not supported'));
      return;
    }
  }

  Viewbridge(config).generate(callback)
};

