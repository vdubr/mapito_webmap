var gulp    = require('gulp');
var minifyCSS = require('gulp-minify-css');
var concat  = require('gulp-concat');

var cssPaths = [
    './bower_components/openlayers3/css/ol.css',
    './bower_components/bootstrap/dist/css/bootstrap.min.css',
    './bower_components/font-awesome/css/font-awesome.min.css',
    './css/*.css',
    './css/font_roboto.css'
 ]
 
/**
 * CSS
 */

/**
 * Take all CSS from cssPaths, minimalise, merge to one file and copy to 
 * appropriate folders
 */
gulp.task('minify-css', function() {
  gulp.src(cssPaths)
    .pipe(minifyCSS())
    .pipe(concat('./all.css'))
    .pipe(gulp.dest('./build/examples/css/'))
})

