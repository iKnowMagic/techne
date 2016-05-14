import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();

const options = {
  src: "src",
  dest: "dest",
  tmp: ".tmp"
};

gulp.task('styles', () => {
  return gulp.src(options.src + '/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sassGlob())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      sourceComments: true,
      includePaths: ['.', 'bower_components/bootstrap-sass/assets/stylesheets/']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(options.tmp + '/styles'));
});

gulp.task('scripts', () => {
  return gulp.src([options.src + '/scripts/**/*.js'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest(options.tmp + '/scripts'));
});

gulp.task('bg-scripts', () => {
  return gulp.src([options.src + '/background/*.js'])
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest(options.dest + '/background'));
});

gulp.task('html', ['styles', 'scripts', 'extras'], () => {
  return gulp.src(options.src + '/*.html')
    .pipe($.plumber())
    .pipe($.eol())
    .pipe($.useref({searchPath: [options.tmp, options.src, '.']}))
    //.pipe($.if('*.js', $.uglify()))
    //.pipe($.if('*.css', $.cssnano()))
    //.pipe($.if('*.js', $.rev()))
    //.pipe($.if('*.css', $.rev()))
    //.pipe($.revReplace())
    //.pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    //.pipe($.html5Lint())
    .pipe(gulp.dest(options.dest));
});

gulp.task('html-pack', ['styles', 'scripts', 'extras'], () => {
  return gulp.src(options.src + '/*.html')
    .pipe($.plumber())
    .pipe($.eol())
    .pipe($.useref({searchPath: [options.tmp, options.src, '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if('*.css', $.rev()))
    .pipe($.revReplace())
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(options.dest));
});

gulp.task('extras', () => {
  return gulp.src([
    options.src + '/*.*',
    '!'+options.src + '/*.html'
  ], {
    dot: true
  })
  .pipe($.newer(options.dest))
  .pipe(gulp.dest(options.dest));
});

gulp.task('content', () => {
  return gulp.src([
    options.src + '/content/*.*'
  ], {
    dot: true
  })
  .pipe($.newer(options.dest + '/content'))
  .pipe(gulp.dest(options.dest + '/content'));
});

gulp.task('images', () => {
  return gulp.src([
    options.src + '/images/**/*.*'
  ])
  .pipe($.newer(options.dest + '/images'))
  .pipe(gulp.dest(options.dest + '/images'));
});

gulp.task('watch', ['clean'], () => {
  gulp.start(['html', 'images', 'content', 'bg-scripts', 'extras']);

  gulp.watch([
    options.src + '/scripts/**/*.js',
    options.src + '/styles/**/*.scss',
    options.src + '/*.html'
  ], ['html']);

  gulp.watch([
    options.src + '/images/**/*.*'
  ], ['images']);

  gulp.watch([
    options.src + '/background/*.js'
  ], ['bg-scripts']);

  gulp.watch([
    options.src + '/*.*',
    '!'+options.src + '/*.html'
  ], ['extras']);

  gulp.watch([
    options.src + '/content/*.*'
  ], ['content']);
});

gulp.task('clean', del.bind(null, [options.tmp, options.dest]));

gulp.task('pack', ['clean'], () => {
  gulp.start(['html-pack', 'images']);
});
