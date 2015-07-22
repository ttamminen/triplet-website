var ghost = require('ghost'),
    express = require('express'),
    hbs  = require('express-hbs'),
    path = require('path'),
    parentApp = express();

var root = process.cwd();

parentApp.engine('hbs', hbs.express4({
  defaultLayout: path.join(root, 'views/layouts/main.hbs')
}));
parentApp.set('view engine', 'hbs');
parentApp.set('views', path.join(root, 'views'));
parentApp.use(express.static(path.join(root, 'public')));

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

ghost({
  config: path.join(root, 'config.js')
}).then(function (ghostServer) {
  parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);  
  require('./helpers')();
  ghostServer.start(parentApp);
});