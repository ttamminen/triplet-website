var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var fileinclude = require('gulp-file-include');
var nodemon = require('gulp-nodemon');
var server = require( 'gulp-develop-server');
var postcss = require('gulp-postcss');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var globby = require('globby');
var through = require('through2');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var streamify = require('gulp-streamify');

// for the release
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var minifyCSS = require('gulp-minify-css');

var assetsRoot = 'assets/';

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

gulp.task('javascript', function () {
  // gulp expects tasks to return a stream, so we create one here.
  var bundledStream = through();

  bundledStream
    // turns the output bundle stream into a stream containing
    // the normal attributes gulp plugins expect.
    .pipe(source('app.js'))
    // the rest of the gulp task, as you would normally write it.
    // here we're copying from the Browserify + Uglify2 recipe.
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      // Add gulp plugins to the pipeline here.
      .pipe(streamify(uglify()))
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'));

  // "globby" replaces the normal "gulp.src" as Browserify
  // creates it's own readable stream.
  globby(['./assets/js/*.js'], function(err, entries) {
    // ensure any errors from globby are handled
    if (err) {
      bundledStream.emit('error', err);
      return;
    }

    // create the Browserify instance.
    var b = browserify({
      entries: entries,
      debug: true,
      transform: []
    });

    // pipe the Browserify stream into the stream we created earlier
    // this starts our gulp pipeline.
    b.bundle().pipe(bundledStream);
  });

  // finally, we return the stream, so gulp knows when this task is done.
  return bundledStream;
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
  gulp.watch(assetsRoot + 'js/**/*', ['javascript', 'server:restart']);
  gulp.watch(assetsRoot + 'styles/**/*.scss', ['sass', 'server:restart']);
  gulp.watch(assetsRoot + 'html/**/*.html', ['html', 'sass', 'javascript', 'server:restart']);
  gulp.watch(assetsRoot + 'images/**/*', ['image', 'server:restart']);
});

gulp.task('site', function () {
  nodemon({
    script: 'index.js',
    env: { 'NODE_ENV': 'production' },
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
gulp.task('default', ['sass', 'image', 'font', 'static', 'javascript', 'server:start', 'watch' ]);

gulp.task('build', ['sassmin', 'image', 'font', 'static', 'javascript', 'site']);