'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var Readable = require('stream').Readable;
var rimraf = require('rimraf');
var FFmpeg = require('./ffmpeg.js');
var AudioPeaks = require('./audiopeaks.js');
var SvgCreator = require('./svgcreator.js');

function convertMP3toSVG(inputFile, outputFile, versions) {
  return new Promise(function (resolve, reject) {
    var tmpDir = '';
    createTempDir().then(function (dir) {
      tmpDir = dir;
      return new FFmpeg().audioToRaw(inputFile, tmpDir);
    }).then(function (rawAudioFile) {
      return createSvgVersions(rawAudioFile, outputFile, versions);
    }).then(function () {
      removeDir(tmpDir).then(resolve);
    }).catch(function (e) {
      removeDir(tmpDir).then(reject(e)).catch(reject(e));
    });
  });
};

function createSvgVersions(rawAudioFile, ouput, versions) {
  var promises = [];
  versions.forEach(function (version) {
    promises.push(createSvgVersion(rawAudioFile, ouput, version));
  });

  return Promise.all(promises);
}

function createSvgVersion(rawAudioFile, output, version) {
  var audioPeaks = new AudioPeaks({
    width: version,
    precision: 1,
    numOfChannels: 2,
    sampleRate: 11500
  });
  var svgCreator = new SvgCreator(version);
  return audioPeaks.getPeaks(rawAudioFile).then(function (peaks) {
    return svgCreator.peaksToSvg(peaks);
  }).then(function (svg) {
    return writeToFile(svg.data, output.replace('.svg', version + '.svg'));
  });
}

function createTempDir() {
  return new Promise(function (resolve, reject) {
    fs.mkdtemp(path.join(os.tmpdir(), 'ffpeaks-'), function (err, tmpPath) {
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

module.exports = convertMP3toSVG;