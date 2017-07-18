"use strict";

import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import ghPages from 'gulp-gh-pages';
import util from 'gulp-util';
import source from 'vinyl-source-stream';

import browserify from 'browserify';

const browserSync = require('browser-sync').create();

/* config
---------------------------------------------------- */

gulp.task('css', () => {
    return gulp.src('src/css/*.css')
    .pipe(autoprefixer({
        browsers: ['> 1%', 'last 3 versions'],
        cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
});


gulp.task('js', () => {
    return browserify({
            entries: ["./src/js/calendar.js"],
            standalone: 'Calendar'
        })
        .transform('babelify', {
            presets: ["es2015"],
            global: true,
            ignore: /node_modules/
        })
        .bundle()
        .on('error', function(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(source("calendar.js"))
        .pipe(gulp.dest("./dist"));
});


gulp.task('js-watch', ['js'], function(done) {
    browserSync.reload();
    done();
});

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('watch', ['serve'], () => {
    gulp.watch('src/css/*.css', ['css']);
    gulp.watch('src/js/*.js', ['js-watch']);
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});

gulp.task('default', ['css', 'js']);
