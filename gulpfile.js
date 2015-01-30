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
        .pipe(gulp.dest(themeRoot + 'css'))
        .pipe(livereload());
});

gulp.task('sassmin', function() {
    return gulp.src(assetsRoot + 'styles/*.scss')
        .pipe(sass()).on('error', gutil.log)
        .pipe(prefix("last 2 version", "> 1%", "ie 8"))
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest(themeRoot + 'css'));
});

gulp.task('scripts', function () {
    return gulp.src([assetsRoot + 'js/**/*.js', '!' + assetsRoot + 'js/vendor/**'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(themeRoot + 'js'))
        .pipe(livereload());
});

gulp.task('scriptsmin', function () {
    return gulp.src([assetsRoot + 'js/bundled_vendor/*.js', assetsRoot + 'js/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(themeRoot + 'js'));
});

gulp.task('vendorscripts', function () {
    return gulp.src(assetsRoot + 'js/vendor/*.js')
        .pipe(gulp.dest(themeRoot + 'js/vendor/'));
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

gulp.task('htmlmin', ['sassmin'], function () {
    return gulp.src(assetsRoot + 'html/*')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))    
        .pipe(htmlreplace({
            'css': 'css/styles.min.css',
            'js': 'js/all.min.js'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('font', function () {
    return gulp.src(assetsRoot + 'fonts/**')
        .pipe(gulp.dest(themeRoot + 'fonts'));
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
        .pipe(gulp.dest('dist/images'));
});

gulp.task('static', function () {
    return gulp.src(assetsRoot + 'static/**', { dot: true })
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
    livereload.listen({ basePath: 'dist' });
    gulp.watch(assetsRoot + 'js/**', ['scripts']);
    gulp.watch(assetsRoot + 'scss/**/*.scss', ['sass']);
    gulp.watch(assetsRoot + 'html/**/*.html', ['html', 'sass', 'scripts']);
    gulp.watch(assetsRoot + 'images/**', ['image']);
});

gulp.task('server', function (next) {
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

// Default Task
gulp.task('default', ['sass', 'image', 'font', 'static', 'scripts', 'html', 'server', 'watch' ]);

gulp.task('build', ['sassmin', 'image', 'font', 'static', 'scriptsmin', 'vendorscripts', 'htmlmin']);

gulp.task('run', ['server']);