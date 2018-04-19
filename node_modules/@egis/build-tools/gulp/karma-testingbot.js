"use strict";

var gulp = require('gulp');
var child_process = require('child_process');

gulp.task('update-karma-testingbot', () => {
    let cmd = [
        'wget https://testingbot.com/downloads/testingbot-tunnel.zip -O testingbot-tunnel.zip',
        'unzip -o testingbot-tunnel.zip',
        'cp -f ./testingbot-tunnel/testingbot-tunnel.jar ./node_modules/testingbot-tunnel-launcher/'
    ];
    return child_process.exec(cmd.join("&&")).toString('utf8').trim();
});
