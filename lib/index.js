#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var Readable = require('stream').Readable;
var rimraf = require('rimraf');
require('./promise_finally_polyfill.js');
var ffmpeg = new (require('./ffmpeg.js'))();
var AudioPeaks = require('./audiopeaks.js');
var SvgCreator = require('./svgcreator.js');

var input = process.argv[2];
var output = process.argv[3];
var numberOfSamples = process.argv[4] || 100;
var tmpDir = '';

console.log('Start MP3 to SVG.....');
console.log("Input:", input);
console.log("Ouput:", output);
console.log("NumberOfSamples:", numberOfSamples);

var audioPeaks = new AudioPeaks({
  width: numberOfSamples,
  precision: 1,
  numOfChannels: 2,
  sampleRate: 11500
});
var svgCreator = new SvgCreator(numberOfSamples);

createTempDir().then(function (dir) {
  tmpDir = dir;
  return ffmpeg.audioToRaw(input, tmpDir);
}).then(function (rawAudioFile) {
  return audioPeaks.getPeaks(rawAudioFile);
}).then(function (peaks) {
  return svgCreator.peaksToSvg(peaks);
}).then(function (svg) {
  return writeToFile(svg, output);
}).then(function () {
  return console.log("Done.");
}).catch(function (e) {
  console.log('Could not convert file: ', e);
  process.exit(1);
}).finally(function () {
  return removeDir(tmpDir);
});

function createTempDir() {
  return new Promise(function (resolve, reject) {
    fs.mkdtemp(path.join(__dirname, '../', 'tmp', 'ffpeaks-'), function (err, tmpPath) {
      if (err) reject(err);else {
        resolve(tmpPath);
      }
    });
  });
}

function writeToFile(data, filename) {
  return new Promise(function (resolve, reject) {
    var readable = new Readable();
    readable.push(data);
    readable.push(null);
    readable.pipe(fs.createWriteStream(filename)).on('finish', function () {
      return resolve();
    }).on('error', function (err) {
      return reject(err);
    });
  });
}

function removeDir(tmpDir) {
  return new Promise(function (resolve, reject) {
    rimraf(tmpDir, function (err) {
      if (err) reject(err);else resolve();
    });
  });
}