'use strict';

module.exports = function redirect(request) {
  // returning null will cause valiquire to ignore require('jquery') statements
  return request !== 'jquery' ? request: null;
};
