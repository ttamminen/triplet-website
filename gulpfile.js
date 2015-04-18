var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var fileinclude = require('gulp-file-include');
var prefix = require('gulp-autoprefixer');
var nodemon = require('gulp-nodemon');
var server = require( 'gulp-develop-server');

// for the release
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var htmlreplace = require('gulp-html-replace');
var minifyCSS = require('gulp-minify-css');

var del = require('del');
var vinylPaths = require('vinyl-paths');

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

var themeRoot = 'content/themes/triplet/assets/';
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
        .pipe(prefix("last 2 version", "> 1%", "ie 8"))
        .pipe(gulp.dest('dist/css'))
        .pipe(livereload());
});

gulp.task('sassmin', function() {
    return gulp.src(assetsRoot + 'styles/*.scss')
        .pipe(sass()).on('error', gutil.log)
        .pipe(prefix("last 2 version", "> 1%", "ie 8"))
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function () {
    return gulp.src([assetsRoot + 'js/**/*.js', '!' + assetsRoot + 'js/vendor/**'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest('dist/js'))
        .pipe(livereload());
});

gulp.task('scriptsmin', function () {
    return gulp.src([assetsRoot + 'js/bundled_vendor/*.js', assetsRoot + 'js/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('vendorscripts', function () {
    return gulp.src(assetsRoot + 'js/vendor/*.js')
        .pipe(gulp.dest('dist/js/vendor/'));
});

gulp.task('html', function () {
    return gulp.src(assetsRoot + 'html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('font', function () {
    return gulp.src(assetsRoot + 'fonts/**')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('image', function () {
    return gulp.src(assetsRoot + 'images/*')
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
        .pipe(gulp.dest('dist/images'));
});

gulp.task('static', function () {
    return gulp.src(assetsRoot + 'static/**', { dot: true })
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', ['createtheme'], function() {
    livereload.listen({ basePath: 'dist' });
    gulp.watch(assetsRoot + 'js/**/*', ['scripts', 'createtheme', 'server:restart']);
    gulp.watch(assetsRoot + 'styles/**/*.scss', ['sass', 'createtheme', 'server:restart']);
    gulp.watch(assetsRoot + 'html/**/*.html', ['html', 'sass', 'scripts', 'createtheme', 'server:restart']);
    gulp.watch(assetsRoot + 'images/**/*', ['image', 'createtheme', 'server:restart']);
});

gulp.task('styleguide', function (next) {
    var url = require('url'),
        fileServer = require('ecstatic')({
            root: './dist', 
            cache: 'no-cache', 
            showDir: true, 
            gzip: true, 
            defaultExt: true }),
        port = 8000;
    require('http').createServer()
        .on('request', function (req, res) {
            fileServer(req, res);
        })    
        .listen(port, function () {
            gutil.log('Server is listening on ' + gutil.colors.magenta('http://localhost:' + port + '/'));
            next();
        });
});

gulp.task('ghost', ['createtheme'], function () {
	nodemon({ 
		script: 'index.js',
        env: { 'NODE_ENV': 'production' },
		ext: 'scss js', 
		ignore: ['dist/**/*', 'core/**/*', 'content/**/*', 'node_modules/**/*'] 
	})
	.on('change', ['sass', 'image', 'font', 'static', 'scripts', 'vendorscripts', 'html', 'createtheme'])
	.on('restart', livereload);
});

gulp.task('createtheme', ['sass', 'image', 'font', 'static', 'scripts', 'vendorscripts', 'html'], function () {
	return gulp.src(['dist/css/**/*.css', 'dist/fonts/**/*.*', 'dist/images/**/*.*', 'dist/js/**/*.js'], { base: './dist'})
		.pipe(gulp.dest(themeRoot));
});

// run server
gulp.task( 'server:start', ['createtheme'], function() {
    server.listen( { path: './index.js' } );
});

// restart server if app.js changed
gulp.task( 'server:restart', ['createtheme'], function() {
    server.restart;
});

// Default Task
gulp.task('default', ['sass', 'image', 'font', 'static', 'scripts', 'vendorscripts', 'html', 'createtheme', 'server:start', 'styleguide', 'watch' ]);

gulp.task('build', ['sassmin', 'image', 'font', 'static', 'scriptsmin', 'vendorscripts', 'html', 'createtheme', 'ghost']);