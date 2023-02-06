'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var os = require('os');
var path = require('path');

var _require = require('stream'),
    Readable = _require.Readable;

var rimraf = require('rimraf');
var FFmpeg = require('./ffmpeg');
var AudioPeaks = require('./audiopeaks');
var SvgCreator = require('./svgcreator');

var numOfChannels = 1;
var sampleRate = 8000;

function normalizePeaks(peaks) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.85;

  var scale = level / Math.max(Math.max.apply(Math, _toConsumableArray(peaks)), Math.abs(Math.min.apply(Math, _toConsumableArray(peaks))));
  return peaks.map(function (x) {
    return x * scale;
  });
}

function createTempDir() {
  return new Promise(function (resolve, reject) {
    fs.mkdtemp(path.join(os.tmpdir(), 'ffpeaks-'), function (err, tmpPath) {
      if (err) {
        reject(err);
      } else {
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
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createSvgVersion(rawAudioFile, output, version) {
  var audioPeaks = new AudioPeaks({
    width: version,
    numOfChannels: numOfChannels
  });
  var svgCreator = new SvgCreator(version);
  return audioPeaks.getPeaks(rawAudioFile).then(function (peaks) {
    return svgCreator.peaksToSvg(normalizePeaks(peaks));
  }).then(function (svg) {
    return writeToFile(svg.data, output.replace('.svg', version + '.svg'));
  });
}

function createSvgVersions(rawAudioFile, ouput, versions) {
  var promises = [];
  versions.forEach(function (version) {
    promises.push(createSvgVersion(rawAudioFile, ouput, version));
  });

  return Promise.all(promises);
}

function convertMP3toSVG(inputFile, outputFile, versions) {
  return new Promise(function (resolve, reject) {
    var tmpDir = '';
    createTempDir().then(function (dir) {
      tmpDir = dir;
      return new FFmpeg({ sampleRate: sampleRate, numOfChannels: numOfChannels }).ffmpegAudioToRaw(inputFile, tmpDir);
    }).then(function (rawAudioFile) {
      return createSvgVersions(rawAudioFile, outputFile, versions);
    }).then(function () {
      removeDir(tmpDir).then(resolve);
    }).catch(function (e) {
      removeDir(tmpDir).then(reject(e)).catch(reject(e));
    });
  });
}

module.exports = convertMP3toSVG;