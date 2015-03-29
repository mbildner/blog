'use strict';

var gulp = require('gulp');
var marked = require('gulp-markdown');

gulp.task('build', function () {
  return gulp.src('src/**/*.md')
    .pipe(marked())
    .pipe(gulp.dest('posts/'));
});


gulp.task('default', ['build']);
