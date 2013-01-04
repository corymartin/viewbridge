Viewbridge
==========

Work in progress
-----

Use your serverside views on the client.
Or just precompile your templates.

Only views/templates specified will be compiled and exported.

Engines currently supported:
[Jade](https://github.com/visionmedia/jade/),
[Hogan](http://twitter.github.com/hogan.js/) *(mustache)*

#### Serverside View File
The attribute comment tells Viewbridge to precompile a clientside function for this view.
`views/user/status.jade`

```jade
//@ viewbridge

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

  -h, --help                    output usage information
  -V, --version                 output the version number
  -e, --engine <engine>         Template engine. Required.
  -d, --dir <dir>               Directory of view files. Default is current directory.
  -v, --views <view1,view2,..>  Views to compile.
  -o, --output <output>         Output file path.
  -n, --namespace <namespace>   Clientside namespace. Default is `viewbridge`
  -x, --ext <extension>         File extension of view files.
  -R, --no-runtime              Do not include the engine's runtime.
  -w, --watch                   Compile templates when files change.
```

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
    - `jade`, `hogan`
- `dir`:       Path to root of views/templates directory. Default is current
               working directory.
- `views`:     Array of views to compile functions for.
               This option can be used instead of or in addtion to Viewbridge attribute comments.
- `output`:    JS file to create.
- `namespace`: Clientside namespace. Default is `viewbridge`. No limit on how deep it
               can go (eg `myapp.foo.templates`). Checks to see if a namespace exists
               before creating a new one.
- `ext`:       File extension. Defaults are Jade:`.jade`, Hogan:`.html`
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
Placing an attribute comment in your template to tell Viewbridge
to compile a clientside function for it.

Viewbridge will also create templates for views specifed by the `views` option
in either the CLI app or the exposed function.

### Jade
`//@ viewbridge` or `//-@ viewbridge`

### Hogan (Mustache)
`{{!@ viewbridge }}`

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
attribute comment `{{!@ viewbridge }}` will have a precompiled function made
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

