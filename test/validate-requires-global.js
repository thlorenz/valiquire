'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, './some-module.js')
  // on linux platforms files are case sensitive, so resolve will fail properly and our custom errors will not appear
  , isMac = require('os').platform() === 'darwin'


test('\nwhen a module requires fs Path and uTils', function (t) {
  var src = '' + function foo() { 
    require('fs');
    require('Path');
    require('uTils');
  }

  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 2, 'finds two errors')
    t.end()
  })
})

test('\nwhen a module requires fs and uTils', function (t) {
  var src = '' + function foo() { 
    require('fs');
    require('uTils');
  }

  validate(pathToModule, src, function (errors) {
    t.similar(errors[0].message, /Cannot find module/, 'warns that module does not exist')
    t.equals(errors.length, 1, 'finds one error')
    t.end()
  })
})

test('\nwhen an installed node_module is required and the node_modules path supplied', function (t) {
  var src = '' + function foo() { 
    require('readdirp');
  }
  
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 0, 'finds no errors')
    t.end()
  })
})

test('\nwhen an installed node_module is required improperly cased', function (t) {
  var src = '' + function foo() { 
    require('reaDDirp');
  }
  
  validate(pathToModule, src, function (errors) {
    t.equals(errors.length, 1, 'finds one error')
    if (isMac) {
      t.similar(errors[0].message, /doesn't exactly match .*directory path/, 'warns that directory paths do not exactly match')
    }
    t.end()
  })
})
