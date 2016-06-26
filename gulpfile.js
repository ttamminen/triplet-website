var gulp = require('gulp');

var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var babel = require('babelify');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var server = require( 'gulp-develop-server');
var postcss = require('gulp-postcss');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var fs = require('fs');

var globby = require('globby');
var through = require('through2');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

// for the release
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var minifyCSS = require('gulp-minify-css');

var assetsRoot = 'assets/';

var env = process.env.NODE_ENV || 'development';

gulp.task('sass', function() {
  return gulp.src(assetsRoot + 'styles/*.scss')
    .pipe(sass())
    .on('error', function (err) {
      var displayErr = gutil.colors.red(err);
      gutil.log(displayErr);
      gutil.beep();
      this.emit('end');
    })
    .pipe(postcss([ require('autoprefixer')({ browsers: ['> 1%', 'IE 9'], cascade: false }) ]))
    .pipe(gulp.dest('public/css'))
    .pipe(livereload());
});

gulp.task('sassmin', function() {
  return gulp.src(assetsRoot + 'styles/*.scss')
    .pipe(sass()).on('error', gutil.log)
    .pipe(postcss([ require('autoprefixer')({ browsers: ['> 1%', 'IE 9'], cascade: false }) ]))
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest('public/css'));
});

function compile(watch) {
  var bundler = watchify(browserify('./assets/js/main.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js/'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
      livereload();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('dev-javascript', function () {
  return watch();
});

gulp.task('javascript', function () {
  return compile(false);
});

gulp.task('font', function () {
  return gulp.src(assetsRoot + 'fonts/**')
    .pipe(gulp.dest('public/fonts'));
});

gulp.task('image', function () {
  return gulp.src(assetsRoot + 'images/**')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        { moveGroupAttrsToElems: false },
        { convertPathData: false },
        { removeViewBox: false}
      ],
      use: [
        pngcrush()
      ]
    }))
    .pipe(gulp.dest('public/images'));
});

gulp.task('static', function () {
  return gulp.src(assetsRoot + 'static/**', { dot: true })
    .pipe(gulp.dest('public'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  livereload.listen({ basePath: 'public' });
  gulp.watch(assetsRoot + 'js/**/*', ['dev-javascript', 'server:restart']);
  gulp.watch(assetsRoot + 'styles/**/*.scss', ['sass', 'server:restart']);
  gulp.watch(assetsRoot + 'html/**/*.html', ['html', 'sass', 'javascript', 'server:restart']);
  gulp.watch(assetsRoot + 'images/**/*', ['image', 'server:restart']);
});

gulp.task('site', function () {
  nodemon({
    script: 'index.js',
    env: { 'NODE_ENV': env },
    ext: 'scss js',
    ignore: ['dist/**/*', 'core/**/*', 'content/**/*', 'node_modules/**/*']
  })
  .on('change', ['sass', 'image', 'font', 'static', 'javascript', 'html'])
  .on('restart', livereload);
});

// run server
gulp.task('server:start', function() {
  server.listen( { path: './index.js' } );
});

// restart server if app.js changed
gulp.task('server:restart', function() {
  server.restart;
});

// Default Task
gulp.task('default', ['sass', 'image', 'font', 'static', 'dev-javascript', 'server:start', 'watch' ]);

gulp.task('build', ['sassmin', 'image', 'font', 'static', 'javascript', 'site']);