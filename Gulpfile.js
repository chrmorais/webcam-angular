'use strict';

var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    templateCache = require('gulp-angular-templatecache'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss'),
    server = require('gulp-express');

gulp.task('compress', function() {
  var assets = useref.assets();

  gulp.src('./app/index.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify({mangle: false })))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('./dist'));
});

gulp.task('uncss', function() {
  gulp.src('./dist/css/style.min.css')
    .pipe(uncss({
      html: ['./app/index.html']
    }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('copy', function() {
  gulp.src('./app/index.html')
    .pipe(useref())
    .pipe(gulp.dest('./dist'));
  gulp.src('./app/lib/fontawesome/fonts/**')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('templates', function() {
  gulp.src('./app/views/**/*.tpl.html')
    .pipe(templateCache({
      root: 'views/',
      module: 'webcam.templates',
      standalone: true
  }))
  .pipe(gulp.dest('./app/scripts'));
});

gulp.task('server', function () {
  server.run({
    file: './server.js',
    env: 'development'
  });
});

gulp.task('server-dist', function () {
  server.run({
    file: './server.js',
    env: 'production'
  });
});

/*gulp.task('services', function () {
  nodemon({
    script: './app/server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' },
    ignore: ['./dist/**']})
    .on('restart', function () {
      console.log('restarted!')
    })
});*/

/*gulp.task('server', function() {
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function(connect, opt) {
      return [ historyApiFallback ];
    }
  });
});

gulp.task('server-dist', function() {
  connect.server({
    root: './dist',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true,
    middleware: function(connect, opt) {
      return [ historyApiFallback ];
    }
  });
});*/

gulp.task('inject', function() {
  var sources = gulp.src(['./app/scripts/**/*.js','./app/stylesheets/**/*.css']);
  return gulp.src('index.html', {cwd: './app'})
  .pipe(inject(sources, {
    read: false,
    ignorePath: '/app'
  }))
  .pipe(gulp.dest('./app'));
});

gulp.task('wiredep', function () {
  gulp.src('./app/index.html')
  .pipe(wiredep({
    directory: './app/lib'
  }))
  .pipe(gulp.dest('./app'));
});

gulp.task('jshint', function() {
  return gulp.src('./app/scripts/**/*.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('css', function() {
  gulp.src('./app/stylesheets/main.styl')
  .pipe(stylus({ use: nib() }))
  .pipe(gulp.dest('./app/stylesheets'));
});

gulp.task('html', function() {
  gulp.src('./app/**/*.html');
});

gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html'], function(event) {
    gulp.start('html');
    server.run({
      file: './server.js',
      env: 'development'
    });
  });

  gulp.watch(['./server.js'], function() {
    server.run({
      file: './server.js',
      env: 'development'
    });
  });

  gulp.watch(['./app/stylesheets/**/*.styl'], function(event) {
    gulp.start('css');
    gulp.start('inject');
    server.notify(event);
  });

  gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], function(event) {
    gulp.start('jshint');
    gulp.start('inject');
    server.notify(event);
  });

  gulp.watch(['./bower.json'], function() {
    gulp.start('wiredep');
  });
});

gulp.task('default', ['templates', 'inject', 'wiredep', 'server', 'watch']);

gulp.task('build', ['templates', 'compress', 'copy', 'server-dist']);
