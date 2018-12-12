const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');
const rimraf = require('rimraf');
const FFmpeg = require('./ffmpeg.js');
const AudioPeaks = require('./audiopeaks.js');
const SvgCreator = require('./svgcreator.js');

const numOfChannels = 1;
const sampleRate = 8000;

function normalizePeaks(peaks, level = 0.85) {
  const scale = level / Math.max(Math.max(...peaks), Math.abs(Math.min(...peaks)));
  return peaks.map(x => x * scale);
}

function createTempDir() {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(path.join(os.tmpdir(), 'ffpeaks-'), (err, tmpPath) => {
      if (err) {
        reject(err);
      } else {
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
  return new Promise((resolve, reject) => {
    rimraf(tmpDir, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createSvgVersion(rawAudioFile, output, version) {
  const audioPeaks = new AudioPeaks({
    width: version,
    numOfChannels,
  });
  const svgCreator = new SvgCreator(version);
  return audioPeaks.getPeaks(rawAudioFile)
    .then(peaks => svgCreator.peaksToSvg(normalizePeaks(peaks)))
    .then(svg => writeToFile(svg.data, output.replace('.svg', `${version}.svg`)));
}

function createSvgVersions(rawAudioFile, ouput, versions) {
  const promises = [];
  versions.forEach((version) => {
    promises.push(createSvgVersion(rawAudioFile, ouput, version));
  });

  return Promise.all(promises);
}

function convertMP3toSVG(inputFile, outputFile, versions) {
  return new Promise((resolve, reject) => {
    let tmpDir = '';
    createTempDir()
      .then((dir) => {
        tmpDir = dir;
        return (new FFmpeg({ sampleRate, numOfChannels })).ffmpegAudioToRaw(inputFile, tmpDir);
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
}

module.exports = convertMP3toSVG;
