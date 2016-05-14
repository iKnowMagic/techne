import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import runSequence from 'run-sequence';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const options = {
  src: "src",
  dest: "web-inspiration",
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
    .pipe(gulp.dest(options.tmp + '/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', (callback) => {
  runSequence(
    'scripts1',
    'background-scripts',
    callback
  );
});

gulp.task('scripts1', () => {
  return gulp.src([options.src + '/scripts/**/*.js'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(options.tmp + '/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('background-scripts', () => {
  return gulp.src([options.src + '/background_scripts/*.js'])
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest(options.tmp + '/background_scripts'))
    .pipe(reload({stream: true}));
});


function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html-pack', ['styles', 'scripts'], () => {
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

gulp.task('html', ['styles', 'scripts'], () => {
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
    .pipe(gulp.dest(options.dest));
});

gulp.task('images', () => {
  return gulp.src(options.src + '/images/**/*')
    .pipe($.plumber())
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(options.dest + '/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat(options.src + '/fonts/**/*'))
    .pipe(gulp.dest(options.tmp + '/fonts'))
    .pipe(gulp.dest(options.dest + '/fonts'));
});

gulp.task('clean', del.bind(null, [options.tmp, options.dest]));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [options.tmp, options.src],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    options.src + '/*.html',
    options.tmp + '/*.html',
    options.tmp + '/scripts/**/*.js',
    options.src + '/images/**/*',
    options.tmp + '/fonts/**/*'
  ]).on('change', reload);

  gulp.watch(options.src + '/**/*.html', [reload]);
  gulp.watch(options.src + '/styles/**/*.scss', ['styles']);
  gulp.watch(options.src + '/scripts/**/*.js', ['scripts']);
  gulp.watch(options.src + '/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', ['default'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [options.dest]
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': options.tmp + '/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(options.src + '/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest(options.src + '/styles'));

  gulp.src(options.src + '/layouts/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest(options.src + '/layouts'));
});

gulp.task('ghPages', () => {
  return gulp.src(options.dest + '/**/*')
    .pipe($.ghPages({
      branch: "dist"
    }));
});

gulp.task('deploy', (callback) => {
  runSequence(
  'clean',
  'build',
  'ghPages',
  callback
  );
});

gulp.task('pack', (callback) => {
  runSequence(
  'clean',
  'build',
  //'ghPages',
  callback
  );
});

gulp.task('to-production', (callback) => {
  runSequence(
    'to-production1',
    'to-production2',
    callback
  );
});

gulp.task('to-production1', () => {
  return gulp.src([
    options.tmp + '/*.*',
    '!'+options.tmp + '/*.html',
    options.src + '/*.json',
  ], {
    dot: true
  })
  .pipe($.newer(options.dest))
  .pipe(gulp.dest(options.dest));
});

gulp.task('to-production2', () => {
  return gulp.src(options.tmp + '/background_scripts/*.js')
  //.pipe($.newer(options.dest + '/background_scripts'))
  .pipe(gulp.dest(options.dest + '/background_scripts'));
});

gulp.task('watch', ['fonts', 'images', 'html'], () => {

  gulp.watch([
    options.src + '/scripts/**/*.js',
    options.src + '/background_scripts/*.js',
    options.src + '/**/*.html',
    options.src + '/styles/**/*.scss'
  ], ['html'], () => {
    gulp.start('to-production');
  });
  gulp.watch(options.src + '/fonts/**/*', ['fonts'], () => {
    gulp.start('to-production');
  });
  gulp.watch(options.src + '/images/**/*', ['images'], () => {
    gulp.start('to-production');
  });

  gulp.watch(options.src + '/manifest.json', ['to-production']);
});

gulp.task('build', ['fonts', 'images'], (callback) => {
  runSequence(
  'html-pack',
  'to-production',
  callback
  );
  //return gulp.src(options.dest + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
