'use strict';
/*jshint asi:true */
var test = require('tap').test
  , valiquire = require('..')
  , path = require('path')

test('given ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('when two modules require ../deps/Uno.js ../deps/dos.js ../deps/cuatro.js', function (t) {
    var errors = valiquire(path.join(__dirname, 'sample'))
    t.equals(errors.length, 2, 'finds two errors')
  })  
})

