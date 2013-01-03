Viewbridge
==========

__W.I.P.__

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
  -v, --views <view1,view2,..>  Templates to compile.
  -o, --output <output>         Output file path.
  -n, --namespace <namespace>   Clientside namespace. Default is `viewbridge`
  -E, --ext <extension>         File extension of view files.
  -w, --watch                   Compile templates when files change.
```

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

API
--------

### Install

```bash
$ npm install viewbridge
```

### viewbridge(options, callback)

`options` properties:

- `engine`:    __Required__. Template engine.
    - `jade`, `hogan`
- `dir`:       Path to root of views/templates directory.
- `views`:     Array of views to compile functions for. See example below.
- `output`:    JS file to create.
- `namespace`: Clientside namespace. Default is `viewbridge`. No limit on how deep it
               can go (eg `myapp.foo.templates`). Checks to see if a namespace exists
               before creating a new one.
- `ext`:       File extension. Defaults are Jade:`.jade`, Hogan:`.hjs`


`callback(err, info)`

- `err`  Error if there was one. Otherwise null.
- `info` properties:
  - `file`:       The file created if the `output` option was set.
  - `javascript`: The generated JS as a string.

The `views` option can be used instead of or in addtion to Viewbridge attribute comments.

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


```bash
$ viewbridge --dir ~/myapp/views \
             --engine hogan \
             --output ~/myapp/public/javascripts/mytemplates.js \
             --watch
```

Any Hogan templates under `~/myapp/views` with attribute comment `{{!@ viewbridge }}`
will have a precompiled function in `~/myapp/public/javascripts/mytemplates.js`

The `--views` option can be used instead of or in addtion to Viewbridge attribute comments.

#### Example

Node.js

```js
var viewbridge = require('viewbridge');

var options = {
  dir: '~/myapp/views'
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
  typeof myapp.templates.user             // 'function'
  typeof myapp.templates.favorites.index  // 'function'
  typeof myapp.templates.favorites.stats  // 'function'
</script>
```

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Notes
-----

- Jade's block, extend, yield, include, etc. do not work clientside.
- Jade's mixins do work.

