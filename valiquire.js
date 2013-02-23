'use strict';
var readdirp         =  require('readdirp')
  , map              =  require('map-stream')
  , fs               =  require('fs')
  , validateRequires =  require('./validate-requires')
  , colors           =  require('ansicolors')
  , directoryFilter  =  [ '!node_modules', '!.git', '!.svn' ];

module.exports = function (root, redirect, cb) {
  if (!cb) { 
    cb = redirect;
    redirect = null;
  }

  function readFile(entry, cb) {
    fs.readFile(entry.fullPath, 'utf-8', function (err, res) {
        if (err) return console.error(err);
        cb(null, { fullPath: entry.fullPath, src: res });
    });
  }

  function validate(opts, cb) {
    validateRequires(opts.fullPath, opts.src, { redirect: redirect }, function (errors) {
      cb(null, errors);  
    });
  }

  var errors = []
    , notOk = colors.red('E') 
    , ok = colors.brightGreen('.');

  readdirp({ root: root, fileFilter: '*.js', directoryFilter: directoryFilter })
    .on('error', function (err) { 
      cb(new Error('When reading ' + root + ':\n' + err.message));
    })
    .pipe(map(readFile))
    .pipe(map(validate))
    .on('data', function (data) {
      process.stdout.write(data.length ? notOk : ok);
      errors = errors.concat(data);
    })
    .on('end', function () { 
      cb(null, errors); 
    });

};

