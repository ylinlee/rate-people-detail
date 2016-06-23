'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    path = require('path'),
    htmlmin = require('gulp-htmlmin'),
    templateCache = require('gulp-angular-templatecache'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint');

var moduleName = 'rate-people-detail';

// Root directory
var rootDirectory = path.resolve('./');
// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

var sourceFiles = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),
  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js')
];

var lintFiles = [
  'gulpfile.js',
].concat(sourceFiles);

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('templates', function() {
    var TEMPLATE_HEADER = '(function() {\'use strict\';angular.module(\'<%= module %>\'<%= standalone %>).run([\'$templateCache\', function($templateCache) {';
    var TEMPLATE_FOOTER = '}]);})();';
    gulp.src(sourceDirectory + '/' + moduleName + '/template/**/*.template.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(templateCache({
            root: 'src/' + moduleName + '/template/',
            module: 'rateApp.' + moduleName,
            standalone: false,
            templateHeader: TEMPLATE_HEADER,
            templateFooter: TEMPLATE_FOOTER
        }))
        .pipe(gulp.dest(sourceDirectory + '/' + moduleName + '/template'));
});

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(concat(moduleName + '.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename(moduleName + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

/**
 * Process
 */
gulp.task('dist', ['templates', 'jshint', 'build']);

gulp.task('watch', function () {
  gulp.watch(sourceFiles, ['dist']);
});

gulp.task('default', ['dist','watch']);