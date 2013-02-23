'use strict';
var path = require('path')
  , vendorDirectory = path.join(__dirname, 'public', 'js', 'vendor')
  , browserModules = [ 'jquery', 'jquery.ui', 'd3'];

module.exports = function redirect(request) {
  // causes valiquire to find all browser modules in the vendor directory
  return ~browserModules.indexOf(request) ? path.join(vendorDirectory, request) : request;  
};
