var utils = require('../utils');
var gulp = require('gulp');
var debug = require('gulp-debug');
var gulpif = require('gulp-if');
var replace = require('gulp-replace');
var zip = require('gulp-zip');
var concat = require('gulp-concat');
var exit = require('gulp-exit');
var sourcemaps = require('gulp-sourcemaps');
var common = require('./common');
var _ = require('lodash');
var path = require('path');
var shelljs = require('shelljs');

gulp.task('plugin_concat', ['compile-main', 'templates'], function() {
     return gulp.src([common.dist.main + "/**/*.js", common.dist.main + "/templates/*.js"])
        .pipe(concat( common.bundles.main ))
        .pipe(gulpif(common.watch, replace('/dist/', '/')))
        .pipe(gulpif(common.watch, replace('http://localhost:' +  common.port  + '/../', 'http://localhost:' +  common.port  + '/')))
        .pipe(debug())
        .pipe(gulp.dest('build/'))
});

function packagePlugin() {
    var file = common.module.main + (common.pkg.plugin ? ".zip" : ".war");
    var distDir = 'tmp';
    shelljs.rm('-rf', distDir);
    var pluginDir = path.join(distDir, "System", "plugins", common.pkg.plugin);
    shelljs.mkdir("-p", pluginDir);
    shelljs.cp("build/*.js", pluginDir);
    var metaInfPluginDir = path.join(distDir, "META-INF");
    shelljs.mkdir("-p", metaInfPluginDir);
    shelljs.cp("package.json", metaInfPluginDir);
    return gulp.src(["tmp/**/*"])
        .pipe(zip(file))
        .pipe(gulp.dest(common.deploy))
        .pipe(gulp.dest('.'))
}

gulp.task('plugin', ['plugin_concat'], function() {
    return packagePlugin();
});

gulp.task('plugin-dev-package', ['dev-bundle-main', 'styles', 'resources'], function() {
    return packagePlugin();
});

gulp.task('plugin_watch', ['plugin-dev-package', 'dev-bundle-tests', 'webserver'], function() {
    _.each(common.bundleKinds, function(kind) {
        gulp.watch([common.srcDirs[kind] + '/**/*.js'], ['dev-recompile-' + kind]);
        gulp.watch([common.srcDirs[kind] + '/.lib-exports.js'], ['dev-recompile-' + kind, 'generate-systemjs-' + kind + '-index']);
    });
    gulp.watch('src/.dev-loader.js', ['plugin-dev-package']);
    gulp.watch('src/**/*.hbs', ['templates']);
    gulp.watch('style/**/*.*', ['styles']);
});
