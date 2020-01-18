'use strict';

const { resolve, join } = require('path');
const { includes } = require('@cdp/tasks');
const { packageName, src } = require('@cdp/tasks/config').build;
const config = require('../../../../config/bundle/rollup-test');
const testee = require('../build.config').default;
const cwd = process.cwd();

const externals = ['i18next'];

module.exports = {
    default: config.default(testee, {
        external: {
            '@cdp/core-utils': 'CDP.Utils',
        },
    }),
    testem: config.testem({
        external: {
            '@cdp/core-utils': 'node_modules/@cdp/core-utils/dist/core-utils',
        },
    }),
    remap: {
        resolve(name, options) {
            const { info: includeExternal } = options;
            if (includes(name, externals)) {
                if (includeExternal) {
                    const [lib, ...paths] = name.split(`${packageName}/`)[1].split('/');
                    return join('node_modules', lib, ...paths);
                }
            } else {
                return resolve(cwd, name.replace(packageName, src));
            }
        }
    },
};
