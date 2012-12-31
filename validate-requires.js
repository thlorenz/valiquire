'use strict';

var detective   =  require('detective')
  , fs          =  require('fs')
  , path        =  require('path')
  , format      =  require('util').format
  , requireLike =  require('require-like')
  , exists      =  fs.exists || path.exists;

module.exports = function validateRequires(fullPath, src, opts, cb) {
  var errors = []
    , currentdir = process.cwd();
  
  if (!cb) {
    cb = opts;
    opts = {};
  }

  // remove shebang
  src = src.replace(/^\#\!.*/, '');

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
    e.message = format('Error parsing %s:\n', fullPath) + e.message;
    cb(opts.strict ? [ e ] : []);
    process.chdir(currentdir);
  }
};

function isFilePath(p) {
  return p.indexOf(path.sep) > 0 || p === '..';
}

function validateRequire(fullPath, requirePath, cb) {
  var header = format('Inside "%s"\nCannot resolve "%s" because:\n', fullPath, requirePath)
      // resolve relative to the module being validated in order to make relative paths and node_modules work
    , resolve = requireLike(fullPath).resolve
    , fullRequiredPath;

  try {
    fullRequiredPath = resolve(requirePath);

    var isCore = fullRequiredPath === requirePath && !isFilePath(fullRequiredPath); 
    if (isCore) return cb(null);
  } catch (e) {
    // module doesn't exist at all - at least we can't find it
    if (e) return cb(new Error(header + e.message));
  }


  exists(fullRequiredPath, function (yes) {
    if (!yes) return cb(new Error(format('%s"%s" doesn\'t exist.', header, fullRequiredPath)));
    
    // Check directory
    // cwd() gives us the path in correct casing, no function of fs/path module does that 
    var dir = path.dirname(fullRequiredPath);
    process.chdir(dir);
    var exactPath = process.cwd();

    if (exactPath !== dir) 
      return cb(new Error(format('%s"%s" doesn\'t exactly match the actual directory path \n"%s"', header, dir, exactPath)));

    // Check filename
    var fullFileName = path.basename(require.resolve(fullRequiredPath));
    fs.readdir(dir, function (err, entries) {
      // Exact match no error
      if (~entries.indexOf(fullFileName)) return cb(null);

      var matchingEntry;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].toLowerCase() === fullFileName.toLowerCase()) {
          matchingEntry = entries[i];
          break;
        }
      }

      cb (new Error(format('%s"%s" doesn\'t exactly match the actual file path\n"%s"', header, fullRequiredPath, path.join(dir, matchingEntry))));
    });
  });
}
