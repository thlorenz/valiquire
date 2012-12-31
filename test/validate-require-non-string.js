'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, './some-module.js')

test('\nwhen source contains non string require, it is ignored by detective and causes no error', function (t) {
  var src = 'var a, b = require(a);' 
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 0, 'finds no error')
    t.end()
  })
})
