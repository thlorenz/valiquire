#!/usr/bin/env node
var valiquire = require('..')
  , args = process.argv.slice(2)
  , tasks = args.length
  , fail = false;

args.forEach(function (p) {
  valiquire(p, function (err, errors) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if (errors.length) {
      fail = true;
      errors.forEach(function (err) {
        console.error(err);  
      });
    }
    if (!--tasks) {
      if (fail) {
        console.error('Encountered errors during validations. Not OK!');
        process.exit(1);
      } else {
        console.log('No validation errors found. Everything OK.');
        process.exit(0);
      }
    } 
  });  
});



