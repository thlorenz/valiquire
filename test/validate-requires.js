'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, './some-module.js')

  // on linux platforms files are case sensitive, so resolve will fail properly and our custom errors will not appear
  , isMac = require('os').platform() === 'darwin'

test('\ngiven ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('\n# when a module requires ./deps/uno', function (t) {
    var src = '' + function foo() { 
      require('./deps/uno');
    }
    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 0, 'finds no error')
      t.end()
    })
  })

  t.test('\n# when a module requires ./Deps/uno.js ./deps/dos.js ', function (t) {
    var src = '' + function foo() { 
      require('./Deps/uno.js');
      require('./deps/dos.js');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 1, 'finds one error')
      if (isMac) {
        t.similar(errors[0].message, /doesn't exactly match .*directory path/, 'warns that directory paths do not exactly match')
      }
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
      if (isMac) {
        t.similar(errors[0].message, /uNo.+doesn't exactly match .*file path/, 'warns that file paths do not exactly match')
        t.similar(errors[0].message, /.+uno.+/, 'includes file that was inexactly matched in the message')
      }
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
      t.similar(errors[0].message, /Cannot find module/, 'warns that module does not exist')
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

  t.test('\n# when a module requires ./deps/Uno ./deps/dos ./deps/cuatro', function (t) {
    var src = '' + function foo() { 
      require('./deps/Uno');
      require('./deps/dos');
      require('./deps/cuatro');
    }

    validate(pathToModule, src, function (errors) {
      t.equals(errors.length, 2, 'finds two errors')
      t.end()
    })
  })  
})

test('\nglobal modules', function (t) {
  
  t.test('\n# when a module requires fs Path and uTils', function (t) {
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

  t.test('\n# when a module requires fs and uTils', function (t) {
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
})

test('\nwhen source contains unparsable code', function (t) {
  var src = ' { wtf require("something") ' 
  validate(pathToModule, src, function (errors) {
    t.similar(errors[0].message, /Error parsing.+some-module/, 'warns that module has invalid code')
    t.equals(errors.length, 1, 'finds one error')
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
