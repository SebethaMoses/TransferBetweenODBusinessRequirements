#!/usr/bin/env node

var fs = require('fs');

var dst = fs.readFileSync('package.json');
var dstJson = JSON.parse(dst);
var srcPath = __dirname  + '/package.json';
var src = fs.readFileSync(srcPath);
var srcJson = JSON.parse(src);
dstJson.devDependencies = Object.assign(srcJson.devDependencies, dstJson.devDependencies);
fs.writeFileSync('package.json', JSON.stringify(dstJson), 'utf8');
