const fs         = require('fs');
const path       = require('path');
const Readable   = require('stream').Readable;
const rimraf     = require('rimraf');
require('./promise_finally_polyfill.js')
const FFmpeg     = require('./ffmpeg.js');
const AudioPeaks = require('./audiopeaks.js');
const SvgCreator = require('./svgcreator.js');

function convertMP3toSVG(inputFile, outputFile, versions) {
  return new Promise((resolve, reject) => {
    let tmpDir = '';
    createTempDir()
      .then(dir => {
        tmpDir = dir;
        return (new FFmpeg).audioToRaw(inputFile, tmpDir);
      })
      .then(rawAudioFile => createSvgVersions(rawAudioFile, outputFile, versions))
      .then(() => {
        removeDir(tmpDir)
          .then(resolve);
      })
      .catch((e) => {
        removeDir(tmpDir)
          .then(reject(e))
          .catch(reject(e));
      });
  });
};

function createSvgVersions(rawAudioFile, ouput, versions){
  let promises = [];
  versions.forEach((version) => {
    promises.push(
      createSvgVersion(rawAudioFile, ouput, version)
    );
  });

  return Promise.all(promises);
}

function createSvgVersion(rawAudioFile, output, version){
  let audioPeaks = new AudioPeaks({
    width: version,
    precision: 1,
    numOfChannels: 2,
    sampleRate: 11500
  });
  let svgCreator = new SvgCreator(version);
  return audioPeaks.getPeaks(rawAudioFile)
    .then(peaks => svgCreator.peaksToSvg(peaks))
    .then(svg => writeToFile(svg.data, output.replace('.svg', `${version}.svg`)));
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

module.exports = convertMP3toSVG
