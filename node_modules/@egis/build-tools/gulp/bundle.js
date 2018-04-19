/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var common = require('./common');
var fixSourcemaps = require('./rollup/fix-sourcemaps');
var debug = require('gulp-debug');
var _ = require('lodash');

_.each(common.bundleKinds, function(kind) {
    gulp.task('fix-' + kind + '-sourcemaps-rollup-index', ['compile-' + kind], function() {
        return fixSourcemaps.distBundleRollupIndex(kind);
    });
    gulp.task('fix-' + kind + '-sourcemaps-main', ['compile-' + kind, 'fix-' + kind + '-sourcemaps-rollup-index'], function() {
        return fixSourcemaps.distBundle(kind);
    });
    gulp.task('fix-' + kind + '-sourcemaps', ['fix-' + kind + '-sourcemaps-rollup-index', 'fix-' + kind + '-sourcemaps-main']);
});

gulp.task('fix-main-build-sourcemaps', ['do-bundle-main'], function() {
    return fixSourcemaps.endBundle('main');
});

gulp.task('do-bundle-main', ['compile-main', 'templates', 'fix-main-sourcemaps'], function() {
    var prod = common.prod;
    var res = gulp.src([common.dist.main + '/templates/*.js', common.dist.main + '/' + common.bundles.main],
        { base: common.dist.main })
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(common.replaceAll());

    if (prod) {
        res = res.pipe(uglify({mangle: false}));
    }

    res = res.pipe(concat(common.bundles.main))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../' + common.srcDirs.main}))
        .pipe(gulp.dest('build'));

    if (prod) {
        res = res.pipe(gzip())
            .pipe(gulp.dest('build'));
    }

    return res;
});

gulp.task('bundle-main', ['do-bundle-main', 'fix-main-build-sourcemaps']);

var bundleTaskDeps = ['bundle-main'];
if (common.pkg.examples) {
    gulp.task('bundle-examples', ['compile-examples', 'fix-examples-sourcemaps']);
    bundleTaskDeps.push('bundle-examples')
}

gulp.task('bundle', bundleTaskDeps);

gulp.task('bundle-tests', ['compile-tests', 'fix-tests-sourcemaps']);
