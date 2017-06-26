var gulp = require('gulp');
var gutil = require("gulp-util");
var webpack = require("webpack");
var notifier = require('node-notifier');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('build-src', function() {
  var config = require('./webpack.config.js');
  webpack(config, function(err, stats) {

    //notifier
    if (stats.compilation.errors.length) {
      notifier.notify({
        title: 'Webpack',
        message: stats.compilation.errors[0].message
      });
    }

    //console log
    gutil.log("[webpack]", stats.toString({}));

    // //uglify
    // gulp.src(config.output.path + '/' + config.output.filename)
    //   .pipe(rename({ suffix: '.min' }))
    //   .pipe(uglify({
    //     // output: {comments: 'license'}
    //   }).on('error', function(err) {
    //         gutil.log(gutil.colors.red('[Error]'), err.toString());
    //         this.emit('end');
    //       })
    //   )
    //   .pipe(gulp.dest(config.output.path))
  });
});



gulp.task('default', ['build-src'])
