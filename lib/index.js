var Viewbridge = require('./viewbridge').Viewbridge;


/**
 * @param {Object} config Same as Viewbridge constructor.
 * @param {Function} callback Called when complete.
 */
module.exports = function(config, callback) {
  // Views dir is required
  if (!config.dir) {
    if (callback) callback(new Error('Views directory is required'));
    return;
  }

  Viewbridge(config).generate(callback)
};

