'use strict';

const { nodeResolve }   = require('@rollup/plugin-node-resolve');
const commonjs          = require('@rollup/plugin-commonjs');
const alias             = require('@rollup/plugin-alias');
const replacer          = require('@rollup/plugin-replace');
const sourcemapDetect   = require('@cdp/tasks/rollup-plugin/source-map-detect');
const sourcemapRoot     = require('@cdp/tasks/rollup-plugin/source-map-root');
const postProcesser     = require('@cdp/tasks/rollup-plugin/post-process');
const {
    config,
    banner,
    merge,
} = require('@cdp/tasks');

const {
    packageName: PACKAGE,
    outName: OUTNAME,
    base: BASE,
    global: GLOBAL,
    domain: DOMAIN,
    dist: DIST,
    built: BUILT,
    relativePath,
} = config.build;

function getConfig(options) {
    const opts = merge({
        sourcemap: 'inline',
        format: 'umd',
        commonjs: {
            include: 'node_modules/**',
        },
    }, options);
    const {
        sourcemap,
        format,
        external: globals,
        commonjs: cjsOptions,
        replace,
        alias: aliasOptions,
        exports,
        postproc,
        domain,
        onwarn,
    } = opts;
    const external = globals && Object.keys(globals);

    const umd = 'umd' === format;
    const cjs = 'cjs' === format;

    return {
        input: `${BUILT}/${BASE}.js`,
        external,
        plugins: [
            replace && replacer(replace),
            aliasOptions && alias(aliasOptions),
            nodeResolve({
                mainFields: ['module', 'main', 'jsnext:main'],
                preferBuiltins: true,
            }),
            cjs && commonjs(cjsOptions),
            sourcemapDetect(),
            sourcemapRoot({ relativePath: relativePath(), sourceRoot: `${domain || DOMAIN}:///${PACKAGE}/` }),
            postproc && postProcesser(postproc),
        ],
        output: [
            {
                banner: banner(),
                file: `${DIST}/${OUTNAME}.mjs`,
                format: 'es',
                preferConst: true,
                sourcemap,
            },
            {
                banner: banner(),
                file: `${DIST}/${OUTNAME}.js`,
                format,
                name: umd ? `${GLOBAL}` : undefined,
                extend: true,
                preferConst: true,
                sourcemap,
                globals: umd ? globals : undefined,
                exports,
            },
        ],
        onwarn,
    };
}

module.exports = getConfig;
