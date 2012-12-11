'use strict';
var readdirp         =  require('readdirp')
  , map              =  require('map-stream')
  , fs               =  require('fs')
  , validateRequires =  require('./validate-requires')
  , directoryFilter  =  [ '!node_modules', '!.git', '!.svn' ];

module.exports = function (root, cb) {
  var errors = [];
  readdirp({ root: root, fileFilter: '*.js', directoryFilter: directoryFilter })
    .on('error', function (err) { 
      cb(new Error('When reading ' + root + ':\n' + err.message));
    })
    .pipe(map(readFile))
    .pipe(map(validate))
    .on('data', function (data) {
      errors = errors.concat(data);
    })
    .on('end', function () { 
      cb(null, errors); 
    });

};

function readFile(entry, cb) {
  fs.readFile(entry.fullPath, 'utf-8', function (err, res) {
      if (err) return console.error(err);
      cb(null, { fullPath: entry.fullPath, src: res });
  });
}

function validate(opts, cb) {
  validateRequires(opts.fullPath, opts.src, function (errors) {
    cb(null, errors);  
  });
}
