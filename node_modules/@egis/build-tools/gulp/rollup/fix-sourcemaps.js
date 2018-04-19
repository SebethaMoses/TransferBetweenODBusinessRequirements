var gulp = require('gulp');
var replace = require('gulp-replace');
var common = require('../common');

module.exports = (function () {
    function fix(mapFile, srcDir, destDir) {
        return gulp.src(mapFile)
            .pipe(replace('../../' + srcDir + '/', ''))
            .pipe(gulp.dest(destDir));
    }

    return {
        distBundle: function (kind) {
            return fix(common.dist[kind] + '/' + common.bundles[kind] + '.map', common.srcDirs[kind],
                common.dist[kind]);
        },

        distBundleRollupIndex: function (kind) {
            return gulp.src(common.dist[kind] + '/' + common.bundles[kind] + '.map')
                .pipe(replace(".rollup-index.js", "../" + common.dist[kind] + "/.rollup-index.js"))
                .pipe(gulp.dest(common.dist[kind]));
        },

        endBundle: function (kind) {
            return fix('build/' + common.bundles[kind] + '.map', common.srcDirs[kind], 'build');
        }
    }
})();
