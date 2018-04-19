/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var flatten = require('gulp-flatten');
var common = require('./common');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function()
{
    return gulp.src("src/**/*.hbs")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(handlebars())
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'TEMPLATES',
            root: 'window'
        }))
        .pipe(flatten())
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../../src'}))
        .pipe(gulp.dest(common.dist.main + '/templates'));
};
