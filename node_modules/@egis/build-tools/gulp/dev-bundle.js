var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var common = require('./common');
var replace = require('gulp-replace');
var babel = require('gulp-babel');
var debug = require('gulp-debug');
var print = require('gulp-print');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var _ = require('lodash');
var gzip = require('gulp-gzip');
var pseudoconcat = require('gulp-pseudoconcat-js');

_.each(common.bundleKinds, function(kind) {
    gulp.task('dev-recompile-' + kind, [], function () {
        var srcDir = common.srcDirs[kind];
        var destDir = common.dist[kind];
        var t0 = {};
        return gulp.src([srcDir + '/**/*.js', srcDir + '/.lib-exports.js', '!' + srcDir + '/**/*_scsslint_*'])
            .pipe(changed(destDir))
            .pipe(print(function(filename) {
                var t = new Date().getTime();
                var fnKey = filename.replace(srcDir, '');
                t0[fnKey] = t;
            }))
            .pipe(sourcemaps.init())
            .pipe(plumber())
            .pipe(debug())
            .pipe(babel({
                highlightCode: true,
                presets: ['es2015']
            }))
            .pipe(sourcemaps.write('.', {includeContent: true}))
            .pipe(gulp.dest(destDir))
            .pipe(print(function(filename) {
                var t = new Date().getTime();
                var fnKey = filename.replace(destDir, '').replace('.map', '');
                var res = t - (t0[fnKey] || 0);
                var report = ['done ', filename, ' in ', res, 'ms'];
                return report.join("");
            }));
    });

    gulp.task('generate-systemjs-' + kind + '-index', ['gen-stage2-wildcard-exports-' + kind, 'dev-recompile-' + kind], function() {
        var destDir  = common.dist[kind];
        return gulp.src([destDir + '/.work/.rollup-wildcard-exports.js', destDir + '/.lib-exports.js'])
            .pipe(debug())
            .pipe(replace(/export \* from '(.+)'/g, "require('$1')"))
            .pipe(concat('dev-index.js'))   //not with dot 'cause Gulp webserver doesn't serve .dotfiles
            .pipe(gulp.dest(destDir + '/'))
    });

    gulp.task('dist-' + kind + '-systemjs', function() {
        var systemjsDir = 'node_modules/systemjs';
        return gulp.src([
                systemjsDir + '/dist/system-polyfills.js',
                systemjsDir + '/dist/system.js'
        ])
            .pipe(gulp.dest(common.dist[kind]))
    });

    var prepareDevLoaderTaskDeps = [];
    if (kind === 'main') prepareDevLoaderTaskDeps.push('dist-' + kind + '-systemjs');
    gulp.task('prepare-' + kind + '-dev-loader', prepareDevLoaderTaskDeps, function() {
        return gulp.src([common.srcDirs[kind] + '/.dev-loader.js'])
            .pipe(sourcemaps.init())
            .pipe(replace('HOST', common.host))
            .pipe(replace('PORT', common.port))
            .pipe(concat('dev-loader.js'))   //not with dot 'cause Gulp webserver doesn't serve .dotfiles
            .pipe(sourcemaps.write('.', {includeContent: true}))
            .pipe(gulp.dest(common.dist[kind]))
    });

    var devBundleTaskDeps = ['generate-systemjs-' + kind + '-index', 'dev-recompile-' + kind,
            'prepare-' + kind + '-dev-loader'];
    if (kind === 'main') devBundleTaskDeps.push('templates');

    gulp.task('dev-bundle-' + kind, devBundleTaskDeps, function() {

        var destDir = common.dist[kind];
        var sources = [common.dist[kind] + '/templates/*.js',
                common.dist[kind] + '/dev-loader.js'];
        if (kind === 'main') {
            sources = _(sources).unshift(common.dist['main'] + '/system.js').value();
            destDir = 'build';
        }
        return gulp.src(sources)
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(pseudoconcat(common.bundles[kind], {
                host: 'http://' + common.host + ':' + common.port + '/'
            }))
            .pipe(sourcemaps.write('.', {includeContent: true}))
            .pipe(gulp.dest(destDir))
            .pipe(gzip())
            .pipe(gulp.dest(destDir));
    });
});

