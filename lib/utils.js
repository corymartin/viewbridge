
/**
 * @param {Array}
 * @returns {Array}
 * @api private
 */
exports.unique = function unique(arr) {
  var uniq = [];
  for (var i = arr.length; i--;) {
    if (!~uniq.indexOf(arr[i])) {
      uniq.push(arr[i]);
    }
  }
  return uniq;
};


/**
 * Removes higher level namespaces found in other namespaces.
 * E.g. ['foo.bar', 'foo', 'foo.aaa', 'foo.bar.yoyo']
 *  => ['foo.aaa', 'foo.bar.yoyo']
 * Purpose being: namespaces need to be verified/created clientside.
 * This minimizes the amount namespaces to be checked clientside.
 *
 * @param {Array}
 * @returns {Array}
 * @api private
 */
exports.reduceNamespaces = function reduceNamespaces(arr) {
  if (arr.length <= 1) return arr;
  for (var i = 0; i < arr.length;) {
    var dupe = arr.some(function(ns, idx) {
      if (i === idx) return false;
      return RegExp('^' + arr[i]).test(ns);
    });
    if (dupe) {
      arr.splice(i, 1);
      i = 0;
    }
    else ++i;
  }
  return arr;
};

