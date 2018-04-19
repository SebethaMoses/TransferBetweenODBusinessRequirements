var rollup = require('./compile-and-bundle');
var gulp = require('gulp');
var generateEs6IndexTasks = require('./generate-es6-index-tasks');
var common = require('../common');
var _ = require('lodash');

_.each(common.bundleKinds, function(kind) {
    generateEs6IndexTasks(kind);

    gulp.task('compile-' + kind, ['generate-es6-index-' + kind], function() {
        return rollup(kind);
    });

});
