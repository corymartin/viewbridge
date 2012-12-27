Viewbridge
==========

__W.I.P.__ Create precompiled clientside templates from serverside templates.

Intention is to have one set of templates for both serverside and clientside usage.
As opposed to having separate, yet overlapping templates on both the server and client.

Work in progress.
Presently [Jade](https://github.com/visionmedia/jade) only.

###### Serverside View File `user/status.jade`
```jade
//@ viewbridge

h1= title
```
###### On the Client, Having Used Viewbridge
```html
<script>
  var html = viewbridge.user.status({title: 'Hello World'});
  // html => <h1>Hello World</h1>
</script>
```

Installation
------------

```bash
$ npm install viewbridge
```

Install CLI tool globally

```bash
$ npm install -g viewbridge
```


API
---

### viewbridge(options, callback)

`options` properties:

- `dir`:       __Required__. Path to root of views/templates directory.
- `views`:     Views to compile templates functions for.
- `output`:    JS file to create.
- `namespace`: Clientside namespace. Default is `viewbridge`

`callback(err, info)`

- `err`  Error if there was one. Otherwise null.
- `info` properties:
  - `file`:       The file created if the `output` option was set.
  - `javascript`: The generated JS as a string.


#### Example
Assume an Express app *myapp* with the following directory stucture.
(Express not required; templates can be located anywhere).

```text
-myapp/
  -src
    app.js
    +routes/
    -public/
      +images
      +javascripts
      +stylesheets
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
###### Node
```js
var viewbridge = require('viewbridge');

var options = {
  dir: '~/myapp/src/views'
, namespace: 'myapp.templates'
, output: '~/myapp/src/public/javascripts/templates.js'
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
###### Clientside
```html
<div id="stats" />

<script src="javascripts/templates.js"></script>
<script>
  var statsdiv = document.getElementById('stats');
  statsdiv.innerHTML =
    myapp.templates.favorites.stats({ /* data */ });
</script>
```

### Template Attribute

In addition to the `views` option passed to the `viewbridge()` function,
you can also place an attribute comment in your template to tell Viewbridge
to compile a clientside function for it.

`//@ viewbridge`
<br>or<br>
`//-@ viewbridge`

Example: The following view will have a template function compiled for it.

```jade
//@ viewbridge

h1= title
ul
  - each val, key in list
    li #{key} : #{val}
```

CLI
---

```bash
Usage: viewbridge -d app/views -v v1,v2 -o deploy/tmpl.js [options]

Options:

  -h, --help                    output usage information
  -V, --version                 output the version number
  -d, --dir <dir>               directory of template files - required
  -v, --views <view1,view2,..>  templates to compile
  -o, --output <output>         output file path
  -n, --namespace <namespace>   clientside namespace
```


Notes
-----

- Presently Jade only.
- block, extend, yield, include, etc. do not work clientside.
- Mixins do work.
