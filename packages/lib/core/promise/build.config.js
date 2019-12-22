'use strict';

const config = require('../../../../config/bundle/rollup-core');

module.exports.default = config({
    external: {
        '@cdp/core-utils': 'CDP.Utils',
        '@cdp/events': 'CDP',
    },
});
