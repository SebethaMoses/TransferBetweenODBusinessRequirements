var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

var rollup = require('./rollup');
var common = require('../common');
var plumber = require('gulp-plumber');
var insert = require('gulp-insert');
var debug = require('gulp-debug');

module.exports = function(bundleKind) {
    var bundleDir = common.dist[bundleKind];
    var moduleName = common.module[bundleKind];
    var entryFile = bundleDir + '/.rollup-index.js';
    var bundleFilename = common.bundles[bundleKind];
    var srcDir = common.srcDirs[bundleKind];
    var res =  gulp.src(entryFile)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(plumber())
        .pipe(debug())
        .pipe(rollup(moduleName))
        .pipe(concat(bundleFilename));
    if (common.dependsOnEgisUi()) {
        // Make client apps' rollup build code run after the EgisUI.loaded: this is needed to make sure client
        // app can work with EgisUI in dev mode. This is because in dev mode app code is loaded asynchronously
        // by SystemJS, and the code client app relies on may become available later.
        res = res.pipe(insert.wrap(common.egisUiModuleName + '.loaded(function() {', '});'));
    }
    return res
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../' + srcDir}))
        .pipe(gulp.dest(bundleDir + '/'))
};
