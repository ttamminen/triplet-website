'use strict';

let ghost = require('ghost'),
  express = require('express'),
  hbs = require('express-hbs'),
  path = require('path'),
  parentApp = express(),
  env = process.env.NODE_ENV || 'development';

const viewsPath = path.join(process.cwd(), 'views');
const layoutsPath = path.join(viewsPath, 'layouts');

function processBuffer(buffer, app) {
  while (buffer.length) {
    const request = buffer.pop();
    app(request[0], request[1]);
  }
}

function makeGhostMiddleware(options, cb) {
  const requestBuffer = [];
  let app = false;

  ghost(options).then((ghost) => {
    app = ghost.rootApp;
    processBuffer(requestBuffer, app);
    cb(ghost);
  });

  return (req, res) => {
    if (!app) {
      requestBuffer.unshift([req, res]);
    } else {
      app(req, res);
    }
  };
}

const forceSsl = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

parentApp.set('port', (process.env.PORT || 5000));

const defaultLayout = path.join(layoutsPath, 'main.hbs');
parentApp.engine('hbs', hbs.express4({ defaultLayout }));
parentApp.set('view engine', 'hbs');
parentApp.set('views', path.join(process.cwd(), 'views'));
parentApp.use(express.static(path.join(process.cwd(), 'public')));

if (env === 'production') {
  parentApp.use(forceSsl);
}

parentApp.get('/', (req, res) => {
  const description = 'TripleT Softworks - Web Development Consulting';
  res.render('home', {
    description,
    title: description,
    layout: 'layouts/main'
  });
});

parentApp.get('/styleguide', (req, res) => {
  res.render('styleguide', {
    layout: false
  });
});

parentApp.get('/thanks', (req, res) => {
  const thanks = 'TripleT Softworks - Thank you for subscribing';
  res.render('thanks', {
    description: thanks,
    title: thanks,
    layout: 'layouts/main'
  });
});

parentApp.get('/project_opportunities', (req, res) => {
  const thanks = 'TripleT Softworks - Project opportunities';
  res.render('project_opportunities', {
    description: thanks,
    title: thanks,
    layout: 'layouts/main'
  });
});

parentApp.get('/workshops/mark_seemann', (req, res) => {
  const thanks = 'TripleT Softworks - Mark Seemann Workshop';
  res.render('workshops/mark_seemann', {
    description: thanks,
    title: thanks,
    layout: '../layouts/main'
  });
});

parentApp.get('/hangout', (req, res) => {
  const hangout = 'TripleT Softworks - Google Hangout';
  res.render('hangout', {
    description: hangout,
    title: hangout,
    layout: 'layouts/main'
  });
});

parentApp.get('/email_policy', (req, res) => {
  const emailPolicy = 'TripleT Softworks - Email Policy';
  res.render('email_policy', {
    description: emailPolicy,
    title: emailPolicy,
    layout: 'layouts/main'
  });
});

parentApp.use('/blog', makeGhostMiddleware({
  config: path.join(process.cwd(), 'config.js')
}, (ghostServer) => {
  require('./helpers')();
}));

parentApp.listen(parentApp.get('port'), () => {
  console.log('Node app is running on port', parentApp.get('port'));
});