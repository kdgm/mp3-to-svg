#!/usr/bin/env node
'use strict';

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

/* eslint no-console: ["error", { allow: ["log"] }] */

var convertMP3toSVG = require('./index');

var _process$argv = _toArray(process.argv),
    inputFile = _process$argv[2],
    outputFile = _process$argv[3],
    versions = _process$argv.slice(4);

console.log('Start MP3 to SVG.....');
console.log('Input:', inputFile);
console.log('Ouput:', outputFile);
console.log('Versions:', versions);

convertMP3toSVG(inputFile, outputFile, versions).catch(function (error) {
  console.log('Something went wrong:', error);
  process.exitCode = 1;
});