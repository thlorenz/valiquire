'use strict';
var readdirp        =  require('readdirp')
  , maps            =  require('map-stream')
  , fs              =  require('fs')
  , directoryFilter =  [ '!node_modules', '!.git', '!.svn' ];

module.exports = function (root, cb) {
  var errors = [];
  readdirp({ root: root, fileFilter: '*.js', directoryFilter: directoryFilter })
    .on('error', function (err) { console.error('fatal error reading files', err); })
    .pipe(maps(fileContent))
    .pipe(maps(validateRequires))
    .on('data', function (data) {
      console.log('data', data);  
    })
    .on('end', function () { console.log('done'); });

};

function fileContent(entry, cb) {
  console.log('processing', entry.fullPath);
  fs.readFile(entry.fullPath, 'utf-8', function (err, res) {
      if (err) return console.error(err);
      cb(null, { fullPath: entry.fullPath, src: res });
  });
}

function validateRequires(opts, cb) {
  require('./lib/validate-requires')(opts.fullPath, opts.src, function (errors) {
    cb(null, errors);  
  });
}

if (module.parent) return;

var f = module.exports;
f(__dirname, function (errors) {
  console.log('results: ', errors);  
});
