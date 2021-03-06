Viewbridge
==========

Shares views or templates between the server and client, making client side template pre-compilation and/or server side view pre-rendering easy.

Only server side views/templates specified will be compiled and exported.

To see in action look at the [examples](https://github.com/corymartin/viewbridge/tree/master/examples).

Engines currently supported:

- [Jade](http://jade-lang.com/)
- [Hogan](http://twitter.github.com/hogan.js/) *(mustache)*
- [EJS](https://github.com/visionmedia/ejs)

#### Serverside View File
The attribute comment, `//@viewbridge`, signifies that Viewbridge should precompile a clientside function for this view.
`views/user/status.jade`

```jade
//@viewbridge

h1= title
```

#### Run Viewbridge
There is a `--watch` option for development.

```bash
$ viewbridge --engine jade --output assets/js/templates.js --watch
```

#### In the Browser
The template function's namespace will mimic its serverside path.

```html
<script src="assets/js/templates.js"></script>
<script>
  var html = viewbridge.user.status({title: 'Just North of Awesome.'});
  // html => "<h1>Just North of Awesome</h1>"
</script>
```

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Viewbridge Command Line Application
-----------------------------------

### Install

```bash
$ npm install -g viewbridge
```

### Usage

```bash
Usage: viewbridge --engine engine_name [options]

Options:

  -h, --help                   output usage information
  -V, --version                output the version number
  -e, --engine <engine>        Template engine. Required.
  -d, --dir <dir>              Directory of view files. Default is current directory.
  -v, --views <v1,v2,..>       Views to compile.
  -a, --all-views              Compile all views.
  -x, --ext <extension>        File extension of view files.
  -o, --output <output>        Output file path.
  -R, --no-runtime             Do not include the engine's runtime.
  -n, --namespace <namespace>  Clientside namespace. Default is `viewbridge`
  -w, --watch                  Compile templates when files change.
```

### Configuration File
Instead of specifying options at the command line, you can use a
JSON configuration of your options.

The file must be named `viewbridge.json` and it must be placed in the
current working directory (where viewbridge is being executed from the CLI).

See example in the tests
[here](https://github.com/corymartin/viewbridge/blob/master/test/viewbridge.json).

Then, call `viewbridge` from the command line with no options (or just the
`--watch` option) to use the options from the configuration file.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

API
--------

### Install

```bash
$ npm install viewbridge
```
```javascript
var viewbridge = require('viewbridge');
```

### viewbridge(options, callback)

`options` properties:

- `engine`:    __Required__. Template engine.
    - `jade`, `hogan`, `ejs`
- `dir`:       Path to root of views/templates directory. Default is current
               working directory.
- `views`:     Array of views to compile functions for.
               This option can be used instead of Viewbridge attribute comments.
               Only views specified by this option will be exported.
- `allviews`:  Compiles all views regardless of attribute comments or `views` option.
- `output`:    JS file to create.
- `namespace`: Clientside namespace. Default is `viewbridge`. No limit on how deep it
               can go (eg `myapp.foo.templates`). Checks to see if a namespace exists
               before creating a new one.
- `ext`:       File extension. Defaults are Jade:`.jade`, Hogan:`.html`, EJS:`.ejs`
- `runtime`:   Include the template engines runtime JS. Default is `true`.
               If `false` you will have to include it yourself separately.


`callback(err, info)`

- `err`  Error if there was one. Otherwise null.
- `info` properties:
    - `file`:       The file created if the `output` option was set.
    - `javascript`: The generated JS as a string.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Viewbridge Attribute Comments
-----------------------------
Placing an attribute comment in your template signifies that Viewbridge
should compile a clientside function for it.

Viewbridge will also create templates for views specifed by the `views` option
in either the CLI app or the exposed function.

### Jade
```
//@viewbridge
//-@viewbridge
```

### Hogan (Mustache)
```
{{!@viewbridge }}
```

### EJS
```
<%/*@viewbridge */%>
<%
  //@viewbridge
%>
```

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Examples
--------
Assume the following directory structure and files for the following examples.
(Vanilla [Express](http://expressjs.com/) app)

```text
-myapp/
  app.js
  +routes/
  -public/
    +images/
    +javascripts/
    +stylesheets/
  -views/
    about.jade
    index.jade
    user.jade
    +status/
    -favorites/
      favorite.jade
      index.jade
      stats.jade
```

#### CLI

```bash
$ viewbridge --dir ~/myapp/views \
             --engine hogan \
             --ext .hjs \
             --output ~/myapp/public/javascripts/mytemplates.js \
             --watch
```

Any Hogan templates under `~/myapp/views` with an extension of `.hjs` and an
attribute comment `{{! @viewbridge }}` will have a precompiled function made
for it in `~/myapp/public/javascripts/mytemplates.js`.
The output file will be updated as changes are made under the views directory.


#### API

Node.js

```js
var viewbridge = require('viewbridge');

var options = {
  dir: '~/myapp/views'
, engine: 'jade'
, namespace: 'myapp.templates'
, output: '~/myapp/public/javascripts/mytemplates.js'
, views: [
    'user'
  , 'favorites/index' // Must specify index
  , 'favorites/stats'
  ]
};

viewbridge(options, function(err, info) {
  // ...
});
```

Browser

```html
<script src="javascripts/mytemplates.js"></script>
<script>
  myapp.templates.user({ /*..data..*/ });

  myapp.templates.favorites.index({ /*..data..*/ });

  myapp.templates.favorites.stats({ /*..data..*/ });
</script>
```

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Notes
-----

- Jade's block, extend, yield, include, etc. do not work clientside.
- Jade's mixins do work.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Change Log
----------

0.4.2

- Refactoring and code improvement.
- If `views` option is specified, only those views will be pre-compiled and exported despite any `@viewbridge` comments.

0.4.1

- Bug fix.

0.4.0

- Node version 0.10.x now required
- Updated dependencies
