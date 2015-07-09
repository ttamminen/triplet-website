var ghost = require('ghost'),
    express = require('express'),
    hbs  = require('express-hbs'),
    path = require('path'),
    parentApp = express();

parentApp.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/layouts/main.hbs'
}));
parentApp.set('view engine', 'hbs');
parentApp.set('views', __dirname + '/views');
parentApp.use(express.static(__dirname + '/public'));

console.log(__dirname + '/views/layouts/main.hbs');

parentApp.get('/', function (req, res) {
  res.render('home');
});

parentApp.get('/styleguide', function (req, res) {
  res.render('styleguide');
});

ghost({
  config: path.join(__dirname, 'config.js')
}).then(function (ghostServer) {
  parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);  
  require('./helpers')();
  ghostServer.start(parentApp);
});