'use strict';

module.exports = function redirect(path) {
  return path.replace(/\/dependencies\//g, '/deps/');
};
