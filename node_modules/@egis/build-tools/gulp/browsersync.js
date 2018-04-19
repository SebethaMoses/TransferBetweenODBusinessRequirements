"use strict";

/**
 * Please use Node 7.0.0+ to run this script
 */

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var common = require('./common');
var _ = require('lodash');
var glob = require('glob');
var utils = require('../utils');
var fs = require('fs');
var argv = require('optimist').argv;
var is = require('is_js');

function loadAppConfig(pkg, pkgRootDir, serveStaticMap, watchedFiles) {
    if (pkg.routes) {
        _.each(pkg.routes, routeItem => {
            let route, routeDir;
            if (is.array(routeItem)) {
                [route, routeDir] = routeItem;
            } else {
                route = routeItem;
                routeDir = 'build'
            }
            route = '/web/' + route;
            serveStaticMap[route] = serveStaticMap[route] || [];

            //serve css directly from app' build folder - this makes CSS injection work and persist on browser reload
            let path = pkgRootDir + '/' + routeDir;
            serveStaticMap[route].push(path);
            console.log(pkgRootDir + ' adds route:', `${route} => ${path}`);
        });
    }

    if (pkg.watchedFiles) {
        _.flatten([pkg.watchedFiles]).forEach(path => {
            path = pkgRootDir + '/' + path;
            console.log(pkgRootDir + ' adds watched path:', path);
            watchedFiles.push(path);
        });
    }
}

function loadApps(rootDir, config) {
    let serveStaticMap = {};
    let watchedFiles = [];

    glob.sync(rootDir + '/*/').forEach(filePath => {
        filePath = filePath.substring(0, filePath.length - 1);
        let jsonPath = filePath + '/portal-browser-sync.json';
        if (utils.exists(jsonPath)) {
            let pkg;
            try {
                pkg = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            } catch (e) {
                console.error('Failed parsing config file' + jsonPath + ':', e);
            }
            loadAppConfig(pkg, filePath, serveStaticMap, watchedFiles);
        }
    });

    let serveStatic = [];

    _.forEach(serveStaticMap, (value, key) => {
        serveStatic.push({route: key, dir: value});
    });

    config.files = watchedFiles;
    config.serveStatic = serveStatic;
}

gulp.task('browsersync', () => {
    let toProxy = (argv['proxied-host'] || 'localhost') + ':' + (argv['proxied-port'] || 8080);

    let config = {
        proxy: toProxy,
        startPath: "/web/portal",
        open: 'external',
        ghostMode: false,
    };

    if (argv.tunnel) config.tunnel = argv.tunnel;
    if (common.port) config.port = common.port;

    loadApps('..', config);

    browserSync.init(config);
});
