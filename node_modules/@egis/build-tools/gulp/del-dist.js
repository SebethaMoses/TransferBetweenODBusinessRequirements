var gulp = require('gulp');
var del = require('del');

module.exports = function(distDir)
{
    return del.sync([distDir + '/**', '!' + distDir], {dot: true});
};
