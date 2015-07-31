var ghost = require('ghost'),
    express = require('express'),
    hbs  = require('express-hbs'),
    path = require('path'),
    parentApp = express();

function processBuffer( buffer, app ){
  while( buffer.length ){
    var request = buffer.pop();
    app( request[0], request[1] );
  }
}

function makeGhostMiddleware(options, cb) {
  var requestBuffer = [];
  var app = false;

  ghost( options ).then( function( ghost ){
    app = ghost.rootApp;
    processBuffer( requestBuffer, app );
    cb();
  });

  return function handleRequest(req, res){
    if(!app) {
      requestBuffer.unshift( [req, res] );
    } else {
      app( req, res );
    }
  };
}

parentApp.set('port', (process.env.PORT || 2368));

parentApp.engine('hbs', hbs.express4({}));
parentApp.set('view engine', 'hbs');
parentApp.set('views', path.join(process.cwd(), 'views'));
parentApp.use(express.static(path.join(process.cwd(), 'public')));

parentApp.get('/', function (req, res) {
  var description = 'TripleT Softworks - Web Development Consulting';
  res.render('home', {
    description: description,
    title: description,
    layout: 'layouts/main'
  });
});

parentApp.get('/styleguide', function (req, res) {
  res.render('styleguide');
});

parentApp.use( '/blog', makeGhostMiddleware({
  config: path.join(process.cwd(), 'config.js')
}, function (ghostServer) {
  require('./helpers')();
}));

parentApp.listen(parentApp.get('port'), function() {
  console.log('Node app is running on port', parentApp.get('port'));
});