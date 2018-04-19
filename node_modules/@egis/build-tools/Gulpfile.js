/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var gulp = require('gulp');
var resources = require('./gulp/resources');
var bower = require('./gulp/bower');
var common = require('./gulp/common');
var pack = require('./gulp/package');
var partials = require('./gulp/partials');
var templates = require('./gulp/templates');
var webserver = require('./gulp/webserver');
var _ = require('lodash');

require('./gulp/styles');
require('./gulp/bundle');
require('./gulp/dev-bundle');
require('./gulp/rollup/tasks');
require('./gulp/plugin');
require('./gulp/karma-testingbot');

gulp.task('resources', resources);
gulp.task('dependencies', ['resources'], bower);
gulp.task('package', ['all'], pack);
gulp.task('all', ['bundle', 'styles', 'resources']);
gulp.task('templates', ['partials'], templates);
gulp.task('partials', partials);
gulp.task('default', ['package', 'webserver', 'watch']);

gulp.task('webserver', webserver(common.port));

var devPackageTaskDeps = ['dev-bundle-main', 'styles', 'resources'];
if (common.pkg.examples) devPackageTaskDeps.push('dev-bundle-examples');

gulp.task('test', function() {});

gulp.task('dev-package', devPackageTaskDeps, pack);

gulp.task('watch', ['dev-package', 'dev-bundle-tests', 'webserver'], function() {
    _.each(common.bundleKinds, function(kind) {
        gulp.watch([common.srcDirs[kind] + '/**/*.js'], ['dev-recompile-' + kind]);
        gulp.watch([common.srcDirs[kind] + '/.lib-exports.js'], ['dev-recompile-' + kind, 'generate-systemjs-' + kind + '-index']);
    });
    gulp.watch('src/.dev-loader.js', ['dev-package']);
    gulp.watch('src/**/*.hbs', ['templates']);
    gulp.watch('style/**/*.*', ['styles']);
});
