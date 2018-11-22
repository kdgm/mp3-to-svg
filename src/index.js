#!/usr/bin/env node

const fs         = require('fs');
const path       = require('path');
const Readable   = require('stream').Readable;
const rimraf     = require('rimraf');
require('./promise_finally_polyfill.js')
const ffmpeg     = new (require('./ffmpeg.js'))();
const AudioPeaks = require('./audiopeaks.js');
const SvgCreator = require('./svgcreator.js');

const [,, input, output, ...versions ] = process.argv;

let tmpDir = '';

console.log('Start MP3 to SVG.....');
console.log("Input:", input);
console.log("Ouput:", output);
console.log("Versions: ", versions);

createTempDir()
  .then(dir => {
    tmpDir = dir;
    return ffmpeg.audioToRaw(input, tmpDir);
  })
  .then(rawAudioFile => createSvgVersions(rawAudioFile, versions))
  .then(() => console.log("Done."))
  .finally(() => {
    console.log('finally');
    return removeDir(tmpDir);
  })
  .catch(e => {
    console.error('Could not convert file: ',e);
    process.exit(1);
  });

function createSvgVersions(rawAudioFile, versions){
  return new Promise((resolve, reject) => {
    let promises = [];
    versions.forEach((version) => {
      promises.push(
        createSvgVersion(rawAudioFile, version)
      );
    });

    Promise.all(promises)
      .then(resolve)
      .catch(reject);
  });
}

function createSvgVersion(rawAudioFile, version){
  return new Promise((resolve, reject) => {
    let audioPeaks = new AudioPeaks({
      width: version,
      precision: 1,
      numOfChannels: 2,
      sampleRate: 11500
    });
    let svgCreator = new SvgCreator(version);
    audioPeaks.getPeaks(rawAudioFile)
      .then(peaks => svgCreator.peaksToSvg(peaks))
      .then(svg => writeToFile(svg, output.replace('.svg', `${version}.svg`)))
      .then(resolve)
      .catch(reject);
  });
}

function createTempDir() {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(path.join(__dirname, '../', 'tmp', 'ffpeaks-'), (err, tmpPath) => {
      if (err)
        reject(err);
      else {
        resolve(tmpPath);
      }
    });
  });
}

function writeToFile(data, filename) {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(data);
    readable.push(null);
    readable
      .pipe(fs.createWriteStream(filename))
      .on('finish', () => resolve())
      .on('error', err => reject(err));
  });
}

function removeDir(tmpDir) {
  return new Promise( (resolve, reject) => {
    rimraf(tmpDir, (err) => {
			if (err)
        reject(err);
      else
        resolve();
    });
  });
}
