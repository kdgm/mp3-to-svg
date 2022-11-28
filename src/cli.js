#!/usr/bin/env node
/* eslint no-console: ["error", { allow: ["log"] }] */

const convertMP3toSVG = require('./index');

const [,, inputFile, outputFile, ...versions] = process.argv;

console.log('Start MP3 to SVG.....');
console.log('Input:', inputFile);
console.log('Ouput:', outputFile);
console.log('Versions:', versions);

convertMP3toSVG(inputFile, outputFile, versions)
  .catch((error) => {
    console.log('Something went wrong:', error);
    process.exitCode = 1;
  });
