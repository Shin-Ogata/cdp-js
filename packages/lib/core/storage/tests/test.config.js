'use strict';

const config = require('../../../../../config/bundle/rollup-test');
const testee = require('../build.config').default;

module.exports = {
    __esModule: true,
    default: config.default(testee, {
        external: {
            '@cdp/core-utils': 'CDP',
            '@cdp/events': 'CDP',
            '@cdp/promise': 'CDP',
        },
    }),
    testem: config.testem({
        external: {
            '@cdp/core-utils': 'node_modules/@cdp/core-utils/dist/core-utils',
            '@cdp/events': 'node_modules/@cdp/events/dist/events',
            '@cdp/promise': 'node_modules/@cdp/promise/dist/promise',
        },
    }),
};
