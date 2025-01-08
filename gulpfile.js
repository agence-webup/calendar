const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const ghPages = require('gulp-gh-pages');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const bs = browserSync.create();

/* config
---------------------------------------------------- */

// CSS Task
gulp.task('css', () => {
    return gulp.src('src/css/*.css')
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 3 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'))
        .pipe(bs.stream());
});

// JS Task
gulp.task('js', () => {
    return browserify({
            entries: ['./src/js/calendar.js'],
            standalone: 'Calendar'
        })
        .transform(babelify, {
            presets: ['@babel/preset-env'],
            global: true,
        })
        .bundle()
        .on('error', function (err) {
            console.error(err);
            this.emit('end');
        })
        .pipe(source('calendar.js'))
        .pipe(gulp.dest('dist'));
});

// Watch JS and reload browser
gulp.task('js-watch', gulp.series('js', (done) => {
    bs.reload();
    done();
}));

// Deploy Task
gulp.task('deploy', () => {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

// Serve Task
gulp.task('serve', () => {
    bs.init({
        server: {
            baseDir: './dist'
        }
    });
});

// Watch Task
gulp.task('watch', gulp.parallel('serve', () => {
    gulp.watch('src/css/*.css', gulp.series('css'));
    gulp.watch('src/js/*.js', gulp.series('js-watch'));
}));

// Default Task
gulp.task('default', gulp.parallel('css', 'js'));
