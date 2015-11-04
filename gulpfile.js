/**
 * TASKS
 *
 *  default
 *  build
 *  lint
 *
 *  1) npm install
 *  2) cd openlayers make install, make build
 */


var olPath = './node_modules/openlayers/';

var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var fs = require('fs');
var del = require('del');
var merge = require('merge-stream');
var connect = require('gulp-connect');
var fixjsstyle = require('closure-linter-wrapper').fixjsstyle;
var gjslint = require('gulp-gjslint');
var runSequence = require('run-sequence');
var glob = require('glob');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');

var olBuild = require(olPath + 'tasks/build');


var cssPaths = [
    olPath + 'css/ol.css',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/font-awesome/css/font-awesome.min.css',
    './css/*.css',
    './css/font_roboto.css'
 ];

gulp.task('buildAdvanced', function(cb) {

  var onBuildDone = function(err, lib) {
    if (err) {
      console.log(err);
    }

    fs.writeFile('./dist/mapito.js', lib, function() {
      connect.reload();
      console.log('asas');
      cb();
    });
  };

  var onReadDone = function(err, cfg) {
    olBuild(cfg, onBuildDone);
  };

  readConfig('./config/mapito_advanced.json', onReadDone);
});

gulp.task('webserver', function() {
  connect.server({
    livereload: true,
    port: 7779,
    root: [__dirname, 'dist'],
    fallback: 'examples/stable/index.html'
  });
});

gulp.task('watch', function() {

  //JS
  gulp.watch(['src/**/*.js'], ['buildAdvanced']);

  //index
  gulp.watch(['examples/**/*'], ['buildAdvanced']);
});

gulp.task('deleteDist', function(cb) {
  return del(['dist/**/*'], cb);
});

gulp.task('copy-files', function() {

  //data
  var data = gulp.src(
    ['examples/stable/data/**/*']).pipe(gulp.dest('dist/data'));

  //html
  var html = gulp.src(['examples/stable/index.html']).pipe(gulp.dest('dist/'));

  //css
  var css = gulp.src(['examples/stable/css/all.css']).pipe(gulp.dest('dist/css'));
  var cssBootstrap = gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css']).pipe(gulp.dest('dist/css'));
  var cssFontAwesome = gulp.src(['./node_modules/font-awesome/css/font-awesome.min.css']).pipe(gulp.dest('dist/css'));
  var cssOl = gulp.src([olPath + 'css/ol.css']).pipe(gulp.dest('dist/css'));
  var cssMapito = gulp.src(['./css/mapito.css']).pipe(gulp.dest('dist/css'));

  //proj4
  var jsProj = gulp.src(['./node_modules/proj4/dist/proj4.js']).pipe(gulp.dest('dist/js'));

  //reactJS
  var jsReact = gulp.src(['./node_modules/react/dist/react.min.js']).pipe(gulp.dest('dist/js'));

  return merge(css, cssBootstrap, cssFontAwesome, cssOl, cssMapito, data, html, jsProj, jsReact);
});

gulp.task('copy', gulpsync.sync(['deleteDist', 'copy-files']));

gulp.task('build', gulpsync.sync(['copy', 'buildAdvanced']));

gulp.task('default', gulpsync.sync(['build', 'watch', 'webserver']), function(cb) {
});



/**
 * Read the build configuration file.
 * @param {string} configPath Path to config file.
 * @param {function(Error, Object)} callback Callback.
 */
function readConfig(configPath, callback) {
  fs.readFile(configPath, function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        err = new Error('Unable to find config file: ' + configPath);
      }
      callback(err);
      return;
    }
    var config;
    try {
      config = JSON.parse(String(data));
    } catch (err2) {
      callback(new Error('Trouble parsing config as JSON: ' + err2.message));
      return;
    }
    callback(null, config);
  });
}


gulp.task('fixjsstyle', function(cb) {
  fix = function(er, files) {
    if (files.length && files.length > 2) {
      var count = 0;
      var fixjsstyleCount = 0;

      //because of windows
      while (files.length) {
        count++;
        var tempFilesArray = files.splice(0, 10);
        var options = {
          src: tempFilesArray,
          force: true,
          reporter: {
            name: 'console'
          },
          flags: [
            '--jslint_error=all',
            '--strict'
          ]
        };

        fixjsstyle(options, function(err, result) {
          if (!err) {
            console.log('Everything went fine', result);
          } else {
            console.log('err: ', err);
          }

          fixjsstyleCount++;
          if (fixjsstyleCount === count) {
            cb();
          }
        });
      }
    }
  };

  glob('src/mapito/**/*.js', {}, fix);
});

gulp.task('gjslint', function() {
  var gjslintOptions = {
    flags: [
      '--strict',
      '--jslint_error=all',
      '--custom_jsdoc_tags=fires,property,todo,api'
      ]
  };

  // return gulp.src(paths.gisonlineSrc + '**/Api.js')
  return gulp.src('src/mapito/**/*.js')
        .pipe(gjslint(gjslintOptions))
        .pipe(gjslint.reporter('console'))
        .pipe(gjslint.reporter('fail'));
});

gulp.task('lint', function(cb) {
  return runSequence('fixjsstyle', 'gjslint', cb);
});


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
   .pipe(gulp.dest('./build/examples/css/'));
});
