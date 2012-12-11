'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../lib/validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, 'fixtures/some-module.js')

test('\ngiven ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('\n# when a module requires ./Deps/uno.js ./deps/dos.js ', function (t) {
    var src = '' + function foo() { 
      require('./Deps/uno.js');
      require('./deps/dos.js');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 1, 'finds one error')
      t.similar(errors[0].message, /doesn't exactly match .*directory path/, 'warns that directory paths do not exactly match')
      t.end()
    })
  })  

  t.test('\n# when a module requires ./deps/uNo.js ./deps/dos.js ', function (t) {
    var src = '' + function foo() { 
      require('./deps/uNo.js');
      require('./deps/dos.js');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 1, 'finds one error')
      t.similar(errors[0].message, /doesn't exactly match .*file path/, 'warns that file paths do not exactly match')
      t.end()
    })
  })  

  t.test('\n# when a module requires ./deps/dos.js ./deps/cuatro.js', function (t) {
    var src = '' + function foo() { 
      require('./deps/dos.js');
      require('./deps/cuatro.js');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 1, 'finds one error')
      t.similar(errors[0].message, /doesn't exist/, 'warns that file does not exist')
      t.end()
    })
  })

  t.test('\n# when a module requires ./deps/Uno.js ./deps/dos.js ./deps/cuatro.js', function (t) {
    var src = '' + function foo() { 
      require('./deps/Uno.js');
      require('./deps/dos.js');
      require('./deps/cuatro.js');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 2, 'finds two errors')
      t.end()
    })
  })  

})

