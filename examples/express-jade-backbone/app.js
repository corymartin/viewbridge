
/**
 * Module dependencies.
 */

var express = require('express');
var http    = require('http');
var path    = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Imagine this is from a database...
var movies = [
  {id: 1229, title: 'Gattica',                studio: 'Columbia',     like: true},
  {id: 1230, title: 'The Matrix',             studio: 'Warner Bros.', like: true},
  {id: 1231, title: 'The Matrix Reloaded',    studio: 'Warner Bros.', like: false},
  {id: 1232, title: 'The Matrix Revolutions', studio: 'Warner Bros.', like: false},
  {id: 1233, title: 'Ironman',                studio: 'Paramount',    like: true},
  {id: 1234, title: 'Pitch Black',            studio: 'Polygram',     like: true},
];


//
// GET: /
//
app.get('/', function(req, res) {
  // This just has a link to the /movies page.
  // Want the demo there to demonstrate things with a deeper namespace
  res.render('index', {
    title: 'Express/Jade/Backbone Demo'
  });
});

//
// GET: /movies
//
app.get('/movies', function(req, res) {
  res.render('movies', {
    title:  'Express/Jade/Backbone Demo',
    movies: movies,
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
