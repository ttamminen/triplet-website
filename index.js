var ghost = require('ghost'),
    express = require('express'),
    hbs  = require('express-hbs'),
    parentApp = express();

parentApp.set('port', (process.env.PORT || 2368));

parentApp.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/layouts/main.hbs'
}));
parentApp.set('view engine', 'hbs');
parentApp.set('views', __dirname + '/views');
parentApp.use(express.static(__dirname + '/public'));

parentApp.get('/', function (req, res) {
  var description = 'TripleT Softworks - Web Development Consulting';
  res.render('home', {
    description: description,
    title: description
  });
});

parentApp.get('/styleguide', function (req, res) {
  res.render('styleguide');
});

parentApp.listen(parentApp.get('port'), function() {
  console.log('Node app is running on port', parentApp.get('port'));
});

ghost({
  config: __dirname + '/config.js'
}).then(function (ghostServer) {
  parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);
  require('./helpers')();
  ghostServer.start(parentApp);
});