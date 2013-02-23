#!/usr/bin/env node
'use strict';

var valiquire   =  require('..')
  , fs          =  require('fs')
  , colors      =  require('ansicolors')
  , requireLike =  require('require-like')
  , args        =  process.argv.slice(2)
  , fail      =  false
  , redirect;

// default project directory to .
if (!args.length) args = ['.'];

var redirectIndex = args.indexOf('--redirect');
if(~redirectIndex) redirect = resolveRedirect(redirectIndex);

var tasks = args.length;

args.forEach(function (p) {
  valiquire(p, redirect, function (err, errors) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('\n');
    if (errors.length) {
      fail = true;
      errors.forEach(function (err) {
        console.log(err);  
      });
    }
    if (!--tasks) {
      if (fail) {
        console.error('[%s] require statements couldn\'t be resolved!', colors.red(errors.length));
        console.error(colors.red('Not OK!'));
        process.exit(1);
      } else {
        console.log('No validation errors found. Everything OK.');
        process.exit(0);
      }
    } 
  });  
});


function resolveRedirect(redirectIndex) {
  var redirectPath = args[redirectIndex + 1];
  
  if (!redirectPath) {
    console.error('If --redirect is supplied the next argument needs to be the path to the module containing the redirect function');
    process.exit(1);
  }

  // remove --redirect path
  args.splice(redirectIndex, 2);
  try {
    redirectPath = fs.realpathSync(redirectPath);
    return require(redirectPath);
  } catch(e) {
    console.error('Unable to resolve redirect', e);
    process.exit(1);
  }
}
