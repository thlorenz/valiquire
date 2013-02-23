# valiquire [![build status](https://secure.travis-ci.org/thlorenz/valiquire.png)](http://travis-ci.org/thlorenz/valiquire)

Validates that all require statements in a project point to an existing path and are correctly cased.

![screenshot](https://raw.github.com/thlorenz/valiquire/master/assets/screenshot.jpg)

*screenshot condensed for brevity*

## Installation

`npm -g install valiquire`

## Usage 

### From root of project

`valiquire .`

### Or from anywhere

`valiquire /path/to/project`


### Redirecting requires

In some scenarios, the require statements aren't resolvable by the nodejs `require` as is. 

As an example this could be the case when using [browserify]() either because modules were aliased or shimmed via
[browserify-shim]().

In these cases we'd like to either tell valiquire where to find the modules and/or to ignore them. In order to do this,
we simply create a module that exports a redirect function and then specify it as the `--redirect` option. 

#### Example:

The below redirect function ignores the `generated-later.json` file and redirects valiquire to the client side vendor
libraries

```js
'use strict';
var path = require('path')
  , vendorDirectory = path.join(__dirname, 'public', 'js', 'vendor')
  , browserModules = [ 'jquery', 'jquery.ui', 'd3'];

module.exports = function redirect(request) {
  // tell valiquire to ignore 'generated-later.json' since it doesn't get generated until the server starts
  if (~request.indexOf('generated-later.json')) return null;

  // tell valiquire to find all browser modules in the vendor directory
  if(~browserModules.indexOf(request)) return path.join(vendorDirectory, request);
  
  // all others we don't redirect
  return request;  
};
```

Assuming we saved this file under `valiquire-redirect.js` in the current folder, we can use it when running valiquire as
follows:

    ➜  valiquire . --redirect valiquire-redirect.js
