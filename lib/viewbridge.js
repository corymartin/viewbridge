var Viewbridge = require('./_viewbridge').Viewbridge;


/**
 * @param {Object} config
 *    - dir:       Path to root of views directory. Required.
 *    - views:     Views to create functions for.
 *    - output:    Filename/path to output templates JS file.
 *    - namespace: Client-side namespace to which views will attach.
 *                 Default is `viewbridge.templates`.
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

