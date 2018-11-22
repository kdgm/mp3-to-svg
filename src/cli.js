#!/usr/bin/env node

const convertMP3toSVG = require('./index.js');

const [,, inputFile, outputFile, ...versions ] = process.argv;

console.log('Start MP3 to SVG.....');
console.log("Input:", inputFile);
console.log("Ouput:", outputFile);
console.log("Versions: ", versions);

convertMP3toSVG(inputFile, outputFile, versions)
  .then((result) => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
