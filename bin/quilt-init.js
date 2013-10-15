#!/usr/bin/env node

var Quilt = require('../lib').Quilt,
    mount = process.argv[2],
    remote = process.argv[3];

Quilt(mount, remote).start();