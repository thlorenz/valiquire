'use strict';
/*jshint asi:true */

var test = require('tap').test
  , validate = require('../validate-requires')
  , path = require('path')
  , pathToModule = path.join(__dirname, './some-module.js')

test('\ngiven ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  var srcUno = '' + function foo() { 
    require('./dependencies/uno');
  }

  var srcUnoAndDos = '' + function foo() { 
    require('./dependencies/uno');
    require('./dependencies/dos');
  }

  var srcUnoAndPseudoDos = '' + function foo() { 
    require('./dependencies/uno');
    require('./otherpseudo/dos');
  }

  t.test('\n# when no redirect is supplied and a module requires ./dependencies/uno', function (t) {
    validate(pathToModule, srcUno, function (errors) {
      t.equals(errors.length, 1, 'finds one error')
      t.end()
    })
  })

  t.test('\n# when a redirect to ./dependencies/uno returns null', function (t) {
    function redirect (m)  { return ~m.indexOf(/dependencies/) ? null : m }

    t.test('\n# # and a module requires ./dependencies/uno', function (t) {
      validate(pathToModule, srcUnoAndDos, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 0, 'finds no error')
        t.end()
      })
    })

    t.test('\n# # and a module requires ./dependencies/uno and ./dependencies/dos', function (t) {
      validate(pathToModule, srcUno, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 0, 'finds no error')
        t.end()
      })
    })

    t.test('\n# # and a module requires ./dependencies/uno and ./otherpseudo/dos', function (t) {
      validate(pathToModule, srcUnoAndPseudoDos, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 1, 'finds one error')
        t.end()
      })
    })
  })

  t.test('\n# when a redirect to ./dependencies/foo returns ./deps/foo', function (t) {
    function redirect (m)  { return m.replace(/\/dependencies\//g, '/deps/') }

    t.test('\n# # and a module requires ./dependencies/uno', function (t) {
      validate(pathToModule, srcUnoAndDos, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 0, 'finds no error')
        t.end()
      })
    })

    t.test('\n# # and a module requires ./dependencies/uno and ./dependencies/dos', function (t) {
      validate(pathToModule, srcUno, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 0, 'finds no error')
        t.end()
      })
    })

    t.test('\n# # and a module requires ./dependencies/uno and ./otherpseudo/dos', function (t) {
      validate(pathToModule, srcUnoAndPseudoDos, { redirect: redirect }, function (errors) {
        t.equals(errors.length, 1, 'finds one error')
        t.end()
      })
    })
  })
})
