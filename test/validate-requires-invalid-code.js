'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, './some-module.js')

test('\nwhen source contains unparsable code and mode is strict', function (t) {
  var src = ' { wtf require("something") ' 
  validate(pathToModule, src, { strict: true }, function (errors) {
    t.similar(errors[0].message, /Error parsing.+some-module/, 'warns that module has invalid code')
    t.equals(errors.length, 1, 'finds one error')
    t.end()
  })
})

test('\nwhen source contains unparsable code and mode is not strict', function (t) {
  var src = ' { wtf require("something") ' 
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 0, 'finds no error')
    t.end()
  })
})

test('\nwhen source starts with shebang and has one valid require', function (t) {
  var src = '#!/usr/bin/env node \n var fs = require("fs");' 
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 0, 'finds no error')
    t.end()
  })
})

test('\nwhen source starts with shebang and has one invalid require', function (t) {
  var src = '#!/usr/bin/env node \n var fs = require("Fs");' 
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 1, 'finds one error')
    t.end()
  })
})
