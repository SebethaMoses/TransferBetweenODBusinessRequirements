var gulp = require('gulp');
var jsonTransform = require('gulp-json-transform');
var directoryMap = require("gulp-directory-map");
var concat = require('gulp-concat');
var _ = require('lodash');
var is = require('is');
var replace = require('gulp-replace');
var common = require('../common');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var debug = require('gulp-debug');

module.exports = function(kind) {
    var srcDir = common.srcDirs[kind];
    var destDir = common.dist[kind];
    var up = '../../';  //let's improve when needed
    var workDir = destDir + '/.work';

    gulp.task('prepare-lib-exports-rollup-' + kind, function () {
        return gulp.src([srcDir + '/.lib-exports.js'])
            .pipe(sourcemaps.init())
            .pipe(replace('./', up + srcDir + '/'))
            .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: up + srcDir}))
            .pipe(gulp.dest(destDir + '/'));
    });

    gulp.task('copy-rollup-index-' + kind, ['prepare-lib-exports-rollup-' + kind], function () {
        var sources = [destDir + '/.lib-exports.js'];
        if (common.build.autoImportAll[kind]) {
            sources.unshift(__dirname + '/propagate/.rollup-index-proto.js');
        }
        return gulp.src(sources, { base: 'src' })
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat('.rollup-index.js'))
            .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: up + srcDir}))
            .pipe(gulp.dest(destDir + '/'));

    });

    gulp.task('gen-stage1-file-list-' + kind, function ()
    {
        return gulp.src([srcDir + '/**/*.js', '!' + srcDir + '/.lib-exports.js', '!' + srcDir + '/**/*_scsslint_*'])
            .pipe(plumber())
            .pipe(debug())
            .pipe(directoryMap({
                filename: 'modules.json'
            }))
            .pipe(gulp.dest(workDir))
    });

    gulp.task('gen-stage2-wildcard-exports-' + kind, ['gen-stage1-file-list-' + kind], function () {
        return gulp.src(workDir + '/modules.json')
            .pipe(jsonTransform(function(data) {
                var blacklist = [];
                var lines = [];
                var fillLines;
                fillLines = function(modulesPathes) {
                    _.forIn(modulesPathes, function(modulePath) {
                        if (is.string(modulePath)) {
                            if (blacklist.indexOf(modulePath) === -1) {
                                lines.push("export * from './" + modulePath.replace(/\.js$/, '') + "';");
                            }
                        } else {
                            fillLines(modulePath);
                        }
                    });
                };
                fillLines(data);
                return lines.sort().join('\n');
            }))
            .pipe(concat('.rollup-wildcard-exports.js'))
            .pipe(gulp.dest(workDir))
    });

    gulp.task('gen-stage3-finalize-exports-' + kind, ['gen-stage2-wildcard-exports-' + kind], function ()
    {
        return gulp.src([workDir + '/.rollup-wildcard-exports.js'])
            .pipe(replace('./', up + srcDir + '/'))
            .pipe(concat('.rollup-wildcard-exports.js'))
            .pipe(gulp.dest(destDir + '/'))
    });

    var lastDeps = ['copy-rollup-index-' + kind];
    if (common.build.autoImportAll[kind]) {
        lastDeps.push('gen-stage3-finalize-exports-' + kind);
    }
    gulp.task('generate-es6-index-' + kind, lastDeps);
};
