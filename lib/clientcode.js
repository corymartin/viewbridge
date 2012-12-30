
/**
 * JS functions that will be inserted into client js (via toString())
 */
module.exports = {
  createNamespace: function(ns_string) {
    // Adapted from JavaScript Patterns by Stoyan Stefanov
    var parts = ns_string.split('.');
    var parent = window;
    for (var i = 0; i < parts.length; i++) {
      if (parent[parts[i]] == null) {
        parent[parts[i]] = {};
      }
      parent = parent[parts[i]];
    }
  }
};

