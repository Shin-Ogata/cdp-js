'use strict';

const config = require('../../../../../config/bundle/rollup-test-testem');
const testee = require('../build.config').default;

module.exports = {
    default: config.default(testee, {
        globals: {
            '@cdp/core-utils': 'CDP.Utils',
            '@cdp/promise': 'CDP',
        },
    }),
    testem: config.testem({
        external: {
            '@cdp/core-utils': 'node_modules/@cdp/core-utils/dist/core-utils',
            '@cdp/promise': 'node_modules/@cdp/promise/dist/promise',
            '@cdp/events': 'node_modules/@cdp/promise/node_modules/@cdp/events/dist/events',
        },
    }),
};
