
Example Apps
============

Pre-render templates on server and share template with Backbone app on client
-------------

The view `views/movies/table_row.*` is used server side and is exported for use in the client via Viewbridge.

Most of the action occurs in `views/movies/index.*`.
This template renders on the server and uses the `table_row.*` template as a partial.

The Backbone View `MovieRow` uses that very same template - `table_row.*` - to render itself.
When the page is loaded, Backbone initializes a `MovieRow` instance for each record but does not
render them since that was already done on the server.
It only renders new records or when there are changes to the data.

The `viewbridge` command in the `Makefile` was used to export the shared template.
It knew to do this because of the `{{! @viewbridge }}` attribute comment in `table_row.*`.


Pre-Rendering
-------------

When rendered on the server, each table row is given a DOM id of `#movie_{{ id }}`.
The shared template, `table_row.*`, is used as a partial.

```mustache
// Server side
{{#movies}}
  <tr id="movie_{{ id }}">
    {{! View/Template used on both server and client }}
    {{> table_row}}
  </tr>
{{/movies}}
```

When the page loads on the client we bootstrap the `movies` collection with the data by calling its `reset()` method.
We also pass a flag, `bootstrap: true`,  indicating that this is bootstrap data (you can change the name to whatever suits you).

```javascript
// Client side, Backbone code
var bootstrapData = {{{data}}};
app.movies.reset(bootstrapData, {bootstrap: true});
```

In our `MovieRow` views, we're listening to `movies` collection for `reset` events.
Our handler, `reset()`, checks for the `bootstrap` flag and if true calls the corresponding `bootstrap` method.
There, we iterate over the `movies` collection and for each we:

- Find the pre-rendered DOM element via its id (`movie_{{id}}`).
- Instantiate a new `MovieRow`, passing to it the model and the DOM element.
- DO NOT call render.

```javascript
// Client side, Backbone code
var bootstrapData = {{{data}}};

bootstrap: function() {
  app.movies.each(function(model) {
    var el = document.getElementById('movie_' + model.id);
    // Since the view was already rendered on the server, we just
    // need to initialize the Backbone View with the model and the
    // DOM element.
    new app.MovieRow({model: model, el: el});
  });
}
```

