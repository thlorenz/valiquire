'use strict';
var detective =  require('detective')
  , fs        =  require('fs')
  , path      =  require('path')
  , format    =  require('util').format
  , findPath  =  require('module')._findPath
  , exists    =  fs.exists || path.exists;

module.exports = function validateRequires(fullPath, src, paths, cb) {
  var errors = []
    , currentdir = process.cwd();
      
  // remove shebang
  src = src.replace(/^\#\!.*/, '');

  try {
    var requires = detective(src)
      , tasks = requires.length;

    if (!tasks) return cb([]);

    requires.forEach(function(requirePath) {
      validateRequire(fullPath, requirePath, paths, function (error) {
        if (error) errors.push(error);
        if (!--tasks) { 
          process.chdir(currentdir);
          cb(errors);
        }
      });
    });
  } catch (e) {
    e.message = format('Error parsing %s:\n', fullPath) + e.message;
    cb([ e ]);
    process.chdir(currentdir);
  }
};

function isFilePath(p) {
  return p.indexOf(path.sep) > 0 || p === '..';
}

function validateRequire(fullPath, requirePath, paths, cb) {
  var header = format('Inside "%s"\nCannot resolve "%s" because:\n', fullPath, requirePath)
    , fullRequiredPath;

  var resolvedPath = isFilePath(requirePath) 
      // In case requirePath is absolute, resolve will just return it
    ? path.resolve(path.dirname(fullPath), requirePath)
    : requirePath;

  try {
    // This will succeed for absolute paths and core modules
    fullRequiredPath = require.resolve(resolvedPath);

    var isCore = fullRequiredPath === resolvedPath && !isFilePath(resolvedPath); 
    if (isCore) return cb(null);
  } catch (e) {

    try {
      // This will succeed for modules relative to the module whose require we are validating
      fullRequiredPath = fullRequiredPath || require.resolve(resolvedPath);
    } catch (e) {
      try {
        // If we don't have a fullRequiredPath by now, we are dealing with an installed node_module
        // use custom find path since require.resolve will be relative to this tool, not to the project we are validating
        // and therefore wouldn't find the right node_modules.
        fullRequiredPath = fullRequiredPath || findPath(requirePath, paths);

        // Still unsucessfull (maybe correct paths weren't supplied)?
        // Let's hope that we are run from the node_modules of the very project we are validating
        fullRequiredPath = fullRequiredPath || require.resolve(requirePath);
      } catch (e) {
        // module doesn't exist at all - at least we can't find it
        if (e) return cb(new Error(header + e.message));
      }
    }
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
