'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../lib/validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, 'fixtures/some-module.js')

test('given ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('when a module requires ./deps/Uno.js ./deps/dos.js ./deps/cuatro.js', function (t) {
    var src = '' + function foo() { 
      require('./deps/Uno.js');
      require('./deps/dos.js');
      require('./deps/cuatro.js');
    }

    validate(pathToModule, src, function (errors) {
      console.log(errors);
      t.equals(errors.length, 2, 'finds two errors')
      t.end()
    })
  })  

  t.test('when a module requires ./Deps/uno.js ./deps/dos.js ', function (t) {
    var src = '' + function foo() { 
      require('./Deps/uno.js');
      require('./deps/dos.js');
    }

    validate(pathToModule, src, function (errors) {
      console.log(errors);
      t.equals(errors.length, 1, 'finds one error')
      t.end()
    })
  })  
})

