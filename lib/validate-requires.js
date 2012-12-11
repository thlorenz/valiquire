'use strict';
var detective =  require('detective')
  , fs        =  require('fs')
  , path      =  require('path')
  , format    =  require('util').format
  , exists    =  fs.exists || path.exists;

module.exports = function validateRequires(fullPath, src, cb) {
  var errors = []
    , currentdir = process.cwd();

  try {
    var requires = detective(src)
      , tasks = requires.length;

    if (!tasks) return cb([]);

    requires.forEach(function(requirePath) {
      validateRequire(fullPath, requirePath, function (error) {
        if (error) errors.push(error);
        if (!--tasks) { 
          process.chdir(currentdir);
          cb(errors);
        }
      });
    });
  } catch (e) {
    cb([ e ]);
    process.chdir(currentdir);
  }
};

function validateRequire(fullPath, requirePath, cb) {
  var fullRequiredPath = path.resolve(path.dirname(fullPath), requirePath)
    , header = format('Inside "%s"\nCannot resolve "%s" because:\n', fullPath, requirePath);

  exists(fullRequiredPath, function (yes) {
    if (!yes) return cb(new Error(format('%s"%s" doesn\'t exist.', header, fullRequiredPath)));
    
    // Check directory
    // cwd() gives us the path in correct casing, no function of fs/path module does that 
    var dir = path.dirname(fullRequiredPath);
    process.chdir(dir);
    var exactPath = process.cwd();

    if (exactPath !== dir) 
      return cb(new Error(format('%s"%s" doesn\'t exactly match the actual path \n"%s"', header, dir, exactPath)));

    // Check filename
    var fullFileName = path.basename(require.resolve(fullRequiredPath));
    fs.readdir(dir, function (err, entries) {
      // Exact match no error
      if (~entries.indexOf(fullFileName)) cb(null);

      var matchingEntry = entries
        .filter(function (e) {
          return e.toLowerCase() === fullFileName.toLowerCase();  
        })[0];

      cb (new Error(format('%s"%s" doesn\'t exactly match\n"%s"', header, fullRequiredPath, path.join(dir, matchingEntry))));
    });
  });
}
