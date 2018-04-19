var connect = require('gulp-connect');

module.exports = function (port)
{
    return function()
    {
        var cors = function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
        };

        return connect.server({
            livereload: false,
            root: process.cwd(),
            port: port,
            middleware: function () {
                return [cors];
            }
        });
    }
};
