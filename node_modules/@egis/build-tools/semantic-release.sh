#!/bin/bash

node_modules/condition-circle/refs.sh && npm publish && node_modules/.bin/semantic-release post
