Viewbridge
==========

__W.I.P.__

Use your serverside views on the client.
Or just precompile your templates.

Only views/templates specified will be compiled and exported.

Supported engines: [Jade], [Hogan]

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
- `engine`:    Template engine. Default is `jade`.
- `ext`:       File extension. Defaults are Jade:`.jade`, Hogan:`.hjs`


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
###### Node
```js
var viewbridge = require('viewbridge');

var options = {
  dir: '~/myapp/src/views'
, namespace: 'myapp.templates'
, output: '~/myapp/src/public/javascripts/mytemplates.js'
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

<script src="javascripts/mytemplates.js"></script>
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

#### Jade
`//@ viewbridge` or `//-@ viewbridge`

```jade
//@ viewbridge

h1= title
ul
  - each item in list
    li= item
```

#### Hogan (Mustache)
`{{!@ viewbridge }}`

```html
{{!@ viewbridge }}

<h1>{{title}}</h1>
<ul>
{{#list}}
  {{.}}
{{/list}}
</ul>
```


CLI
---

```bash
Usage: viewbridge -d app/views [options]

Options:

  -h, --help                    output usage information
  -V, --version                 output the version number
  -d, --dir <dir>               directory of template files - required
  -v, --views <view1,view2,..>  templates to compile
  -o, --output <output>         output file path
  -n, --namespace <namespace>   clientside namespace - default is `viewbridge`
  -e, --engine <engine>         template engine - default is `jade`
  -E, --ext <extension>         file extension - defaults are Jade:`.jade`, Hogan:`.hjs`
```

Example

```bash
$ viewbridge -d ~/myapp/src/views \
             -e hogan \
             -o ~/myapp/src/public/javascripts/mytemplates.js
```

Any Hogan templates under `~/myapp/src/views` with attribute comment `{{!@ viewbridge }}`
will have a precompiled function in `~/myapp/src/public/javascripts/mytemplates.js`


Notes
-----

- Jade's block, extend, yield, include, etc. do not work clientside.
- Jade's mixins do work.


[Jade]:  https://github.com/visionmedia/jade/ 'Jade'
[Hogan]: http://twitter.github.com/hogan.js/  'Hogan'
