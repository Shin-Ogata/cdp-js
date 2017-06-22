﻿/* eslint-env node, es6 */
'use strict';
const path      = require('path');
const fs        = require('fs');
const NYC       = require('nyc');
const convert   = require('convert-source-map');
const config    = require('../project.config');

const BUILT_DIR     = path.join(__dirname, '..', config.dir.built);
const COVERAGE_PATH = path.join(__dirname, '..', config.dir.doc, 'reports/coverage', 'coverage.json');

const coverage = require(COVERAGE_PATH);

function main() {
    const nyc = new NYC();

    const detectMapFile = (srcPath) => {
        let map;
        if (fs.existsSync(srcPath + '.map')) {
            map = JSON.parse(fs.readFileSync(srcPath + '.map').toString());
        } else {
            map = convert.fromComment(fs.readFileSync(srcPath).toString()).toObject();
        }

        // restore namespace to path
        const prefix = `../${config.dir.src}/` + (config.dir.script ? `${config.dir.script}/` : '');
        for (let i = 0, n = map.sources.length; i < n; i++) {
            const match = map.sources[i].match(/(^[a-zA-Z0-9/@._-]+:\/\/\/)([a-zA-Z0-9/@._-]+$)/);
            if (match && match[2]) {
                map.sources[i] = prefix + match[2];
            }
        }

        // test
        fs.writeFileSync("fuga.json", JSON.stringify(map, null, 4), 'utf-8');
        return map;
    };

    console.log('remap coverage info...');

    let rebuild = {};
    for (let file in coverage) {
        console.log('  processing... : ' + file);
        const absPath = path.join(BUILT_DIR, file);
        rebuild[absPath] = coverage[file];
        rebuild[absPath].path = absPath;
        rebuild[absPath].inputSourceMap = detectMapFile(absPath);
    }

    rebuild = nyc.sourceMaps.remapCoverage(rebuild);

    fs.writeFileSync(COVERAGE_PATH,
      JSON.stringify(rebuild, null, 4),
      'utf-8'
    );
}

main();
