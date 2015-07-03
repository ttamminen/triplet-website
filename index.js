var ghost = require('ghost'),
    express = require('express'),
    path = require('path'),
    parentApp = express();

parentApp.get('/', function(req, res) {
  res.redirect('/blog');
});

parentApp.use(express.static(__dirname + '/public'));

ghost({
	config: path.join(__dirname, 'config.js')
}).then(function (ghostServer) {
  parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);  
  require('./helpers')();
  ghostServer.start(parentApp);
});