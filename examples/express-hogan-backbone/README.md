The view `views/movies/table_row.hjs` is used server side and is exported for use in the client via Viewbridge.

Most of the action occurs in `views/movies/index.hjs`.
This template renders on the server and uses the `table_row.hjs` template as a partial.

The Backbone View `MovieRow` uses that very same template - `table_row.hjs` - to render itself.
When the page is loaded, Backbone initializes a `MovieRow` instance for each record but does not render them since that was already done on the server.
It only renders new records or when there are changes to the data.

The `viewbridge` command in the `Makefile` was used to export the shared template.

