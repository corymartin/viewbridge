Viewbridge
==========

__W.I.P.__ Create precompiled clientside templates from serverside templates.

Intention is to have one set of templates for both serverside and clientside usage.
As opposed to having separate, yet overlapping templates on both the server and client.

Work in progress.
Presently [Jade](https://github.com/visionmedia/jade) only.

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

```options``` properties:

- ```dir```:       Path to root of views/templates directory. __Required__.
- ```views```:     Views to compile templates functions for. __Required__.
- ```output```:    JS file to create.
- ```namespace```: Clientside namespace. Default is ```viewbridge.templates```

```callback(err, info)```

- ```err``` An if there was one. Otherwise null.
- ```info``` properties:
  - ```file```:       The file created if the ```output``` option was set.
  - ```javascript```: The generated JS as a string.


#### Example
Assume an Express app "myapp" with the following directory stucture.
(Express not required; templates can be located anywhere).

```text
-myapp/
  -deploy/
    -assets/
      +js/
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

Then in your client code:

```html
<div id="stats" />

<script src="javascripts/templates.js"></script>
<script>
  var statsdiv = document.getElementById('stats');
  statsdiv.innerHTML =
    myapp.templates.favorites.stats({ /* data */ });
</script>
```


CLI
---

```bash
Usage: viewbridge [options]

Options:

  -h, --help                    output usage information
  -V, --version                 output the version number
  -d, --dir <dir>               directory of template files - required
  -v, --views <view1,view2,..>  templates to compile - required
  -o, --output <output>         output file path - required
  -n, --namespace <namespace>  clientside namespace
```


Notes
-----

- Presently Jade only.
- block, extend, yield, include, etc. do not work clientside.
- Mixins do work.
