'use strict';
/*jshint asi:true */
var test = require('tap').test
  , valiquire = require('..')
  , path = require('path')

test('given ./deps/uno.js ./deps/dos.js ./deps/tres.js', function (t) {
  t.test('when two modules require ../deps/Uno.js ../deps/dos.js ../deps/cuatro.js', function (t) {
    valiquire(path.join(__dirname, 'validate'), function (err, errors) {
      console.log(errors);
      t.equals(errors.length, 4, 'finds four errors')
      t.end()
    })
  })  
})

