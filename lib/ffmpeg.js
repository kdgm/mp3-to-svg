'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var ffmpeg = function () {
  function ffmpeg() {
    _classCallCheck(this, ffmpeg);
  }

  _createClass(ffmpeg, [{
    key: 'audioToRaw',
    value: function audioToRaw(input, tmpPath) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.ffmpegAudioRemux(input, tmpPath).then(function (remuxedFile) {
          return _this.ffmpegAudioToRaw(remuxedFile, tmpPath);
        }).then(function (convertedFile) {
          return resolve(convertedFile);
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }, {
    key: 'ffmpegAudioRemux',
    value: function ffmpegAudioRemux(input, tmpPath) {
      return new Promise(function (resolve, reject) {
        var errorMsg = '';
        var remuxfilepath = path.join(tmpPath, 'remux.mp3');
        var ffmpeg = spawn('ffmpeg', ['-v', 'error', '-i', input, '-c:a', 'copy', '-y', remuxfilepath]);
        ffmpeg.stdout.on('end', function () {
          return resolve(remuxfilepath);
        });
        ffmpeg.stderr.on('data', function (err) {
          return errorMsg += err.toString();
        });
        ffmpeg.stderr.on('end', function () {
          if (errorMsg) reject(new Error(errorMsg));
        });
      });
    }
  }, {
    key: 'ffmpegAudioToRaw',
    value: function ffmpegAudioToRaw(input, tmpPath) {
      return new Promise(function (resolve, reject) {
        var errorMsg = '';
        var rawfilepath = path.join(tmpPath, 'audio.raw');
        var ffmpeg = spawn('ffmpeg', ['-v', 'error', '-i', input, '-f', 's16le', '-ac', 2, '-acodec', 'pcm_s16le', '-ar', '11025', '-y', rawfilepath]);
        ffmpeg.stdout.on('end', function () {
          return resolve(rawfilepath);
        });
        ffmpeg.stderr.on('data', function (err) {
          return errorMsg += err.toString();
        });
        ffmpeg.stderr.on('end', function () {
          if (errorMsg) reject(new Error(errorMsg));
        });
      });
    }
  }]);

  return ffmpeg;
}();

module.exports = ffmpeg;