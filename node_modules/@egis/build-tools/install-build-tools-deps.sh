#!/bin/bash

cp package.json package.json.bak
BASEDIR=$(dirname "$0")
node $BASEDIR/merge-build-tools-deps.js
yarn --ignore-engines
mv package.json.bak package.json
