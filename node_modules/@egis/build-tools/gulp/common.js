/**
 * Created by Nikolay Glushchenko <nick@nickalie.com> on 08.09.2015.
 */

var fs = require('fs');
var minimist = require('minimist');
var lazypipe = require('lazypipe');
var replace = require('gulp-replace');
var utils = require('../utils');
var deploy = process.env.WORK_DIR;
var _ = require('lodash');
var argv = require('optimist').argv;

var knownOptions = {
    string: 'env',
    default: {
        env: process.env.NODE_ENV || 'development',
        watch: process.env.watch || false

    }
};

var options = minimist(process.argv.slice(2), knownOptions);

if (deploy != null)
{
    deploy += '/work/';
}
else
{
    deploy = 'build/';
}

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var mainFile = pkg.mainFile;
if (!mainFile) {
    var parts = pkg.name.split('/');
    mainFile = parts[parts.length - 1];
}

var main = '../build/' + mainFile;
var bowerJson = {};

if (pkg.plugin != null)
{
    deploy += "plugins";
}
else
{
    deploy += "webapps";
    var bPath = 'bower.json';
    bowerJson = utils.exists(bPath) ? JSON.parse(fs.readFileSync(bPath, 'utf8')) : {};
}

bowerJson.excludes = bowerJson.excludes || [];
bowerJson.standalone = bowerJson.standalone || [];
bowerJson.directories = bowerJson.directories || {};
bowerJson.overrides = bowerJson.overrides || {};
var gitHash = (utils.exists('.git/') ? utils.sh('git rev-parse --short HEAD') : 'current');
var timestamp = utils.dateFormat(new Date(), '%Y-%m-%d %H:%M:%S')
var replaceAll = lazypipe()
    .pipe(function ()
    {
        return replace('@@version', pkg.version + " " + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@js_suffix', '.js?rel=' + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@css_suffix', '.css?rel=' + gitHash)
    })
    .pipe(function ()
    {
        return replace('@@timestamp', timestamp)
    });

var distDir = 'dist';
var bundles = {
    main: mainFile + '.js',
    tests: 'tests-bundle.js',
    examples: 'examples-bundle.js'
};

var bundleKinds = ['main', 'tests'];
if (pkg.examples) bundleKinds.push('examples');

pkg = _.assign({build: {}}, pkg);
pkg.build = _.assign({autoImportAll: true}, pkg.build); //so pkg.build.autoImportAll will be true by default

var config = {
    deploy: deploy,
    pkg: pkg,
    bundleKinds: bundleKinds,
    bundles: bundles,
    srcDirs: {
        main: 'src',
        tests: 'test',
        examples: 'examples'
    },
    bowerJson: bowerJson,
    watch: options.watch,
    host: argv.host || pkg.host || 'localhost',
    port: argv.port || pkg.port || '8101',
    prod: !process.env.DEV && options.env === 'production',
    main: main,
    replaceAll: replaceAll,
    build: {
        autoImportAll: {
            main: pkg.build.autoImportAll,
            tests: true,
            examples: true
        }
    },
    dist: {
        dir: distDir,
        main: distDir + '/main',
        tests: distDir + '/test',
        examples: distDir + '/examples'
    },
    module: {
        main: pkg.moduleName,
        tests: 'Tests',
        examples: 'Examples'
    },
    egisUiPkgName: '@egis/egis-ui',
    egisUiModuleName: 'EgisUI',
};

config.dependsOnEgisUi = function() {
    return pkg.devDependencies && pkg.devDependencies[config.egisUiPkgName] ||
        pkg.dependencies && pkg.dependencies[config.egisUiPkgName];
};

module.exports = config;
