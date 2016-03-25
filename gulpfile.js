var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var server = require( 'gulp-develop-server');
var postcss = require('gulp-postcss');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var globby = require('globby');
var through = require('through2');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

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

gulp.task('dev-javascript', function () {
  var b = browserify('./assets/js/main.js');

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('javascript', function () {
  var b = browserify('./assets/js/main.js');

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'));
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
gulp.task('default', ['sass', 'image', 'font', 'static', 'dev-javascript', 'server:start', 'watch' ]);

gulp.task('build', ['sassmin', 'image', 'font', 'static', 'javascript', 'site']);