'use strict';

const bundle_src = require('../../../config/bundle/rollup-core');
const bundle_dts = require('../../../config/bundle/dts-bundle');
const minify_js  = require('../../../config/minify/terser');

function patch(index, code) {
    if (0 !== index) {
        return code;
    }

    code = code
        // trim `import("xxx").`
        .replace(/import\("[\S]+"\)\./g, '')
    ;

    return code;
}

module.exports = {
    __esModule: true,
    default: bundle_src({
        // ES モジュールの top-level の `this` は常に `undefined`.
        // https://github.com/rollup/rollup/issues/1518
        onwarn(warning, warn) {
            if ('THIS_IS_UNDEFINED' === warning.code) {
                return;
            }
            warn(warning);
        }
    }),
    dts: bundle_dts({
        inlinedLibraries: ['lit-html'],
        excludeLibraries: [/^@cdp/],
        postProcess: patch,
    }),
    minify: {
        js: minify_js(),
    },
};
