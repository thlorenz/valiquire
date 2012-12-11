'use strict';
/*jshint asi:true */
var test = require('tap').test
  , jic = require('..')
  , path = require('path')

test('given ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('when a module requires ./deps/Uno.js ./deps/dos.js ./deps/cuatro.js', function (t) {
    var errors = jic(path.join(__dirname, 'fixtures/one-file'))
    t.equals(errors.length, 2, 'finds two errors')
  })  
})

