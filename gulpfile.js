var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass');

gulp.task('js', function() {
    gulp.src(['./src/javascripts/*.es6'])
        .pipe(babel())
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('html', function () {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('./public'));
});

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
            errLogToConsole: true}))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch', ['sass', 'html', 'js'], function () {
    gulp.watch(['./src/javascripts/*.es6'], ['js']);
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
});

gulp.task('default', ['watch']);