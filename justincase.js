'use strict';
var detective = require('detective')
  , readdirp = require('readdirp')
  , maps = require('map-stream')
  , fs = require('fs')
  , directoryFilter = [ '!node_modules', '!.git', '!.svn' ];

module.exports = function (root, cb) {
  var errors = [];
  readdirp({ root: root, fileFilter: '*.js', directoryFilter: directoryFilter })
    .on('error', function (err) { console.error('fatal error reading files', err); })
    .pipe(maps(fileContent))
    .pipe(maps(validateRequires))
    .on('end', function () { console.log('done'); });

};

function fileContent(entry, cb) {
  fs.readFile(entry.fullPath, 'utf-8', function (err, res) {
      if (err) return console.error(err);
      cb(null, { fullPath: entry.fullPath, content: res });
  });
}

function validateRequires(fullPath) {

}
