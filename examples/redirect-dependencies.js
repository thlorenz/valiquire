'use strict';

module.exports = function redirect(request) {
  // causes valiquire to lookup './deps/foo' when it validates require('./dependencies/foo')
  return request.replace(/\/dependencies\//g, '/deps/');
};
