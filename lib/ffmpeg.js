'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var spawn = require('child_process').spawn;

var FFmpeg = function () {
  function FFmpeg() {
    _classCallCheck(this, FFmpeg);
  }

  _createClass(FFmpeg, [{
    key: 'audioToRaw',
    value: function audioToRaw(input, tmpPath) {
      var _this = this;

      return this.ffmpegAudioRemux(input, tmpPath).then(function (remuxedFile) {
        return _this.ffmpegAudioToRaw(remuxedFile, tmpPath);
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

  return FFmpeg;
}();

module.exports = FFmpeg;

// https://github.com/t4nz/ffmpeg-peaks

// MIT License
//
// Copyright (c) 2016 Gaetano Fiorello
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.