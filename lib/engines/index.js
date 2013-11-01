var fs     = require('fs');
var path   = require('path');
var jade   = require('jade');
var hogan  = require('hogan.js');
var ejs    = require('ejs');


/*
 * Utils
 */
exports.isSupported = function(name) {
  return !!~Object.keys(ENGINE).indexOf(name.toLowerCase());
};

exports.each = function(cb) {
  for (var eng in ENGINE) {
    cb(ENGINE[eng]);
  }
};


/*
 * Engine Specific Configs/Settings
 */
const ENGINE = {};
exports.ENGINE = ENGINE;


/*
 * Load Engine Configs
 */
fs.readdirSync(__dirname).forEach(function(file) {
  if (file === 'index.js') return;
  if (! /\.js$/.test(file)) return;
  var name = file.replace(/(\w+)\.js$/, '$1');
  ENGINE[name] = require('./' + name);
});

