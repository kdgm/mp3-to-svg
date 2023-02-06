'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');

var _require = require('child_process'),
    spawn = _require.spawn;

var _require2 = require('url'),
    URL = _require2.URL;

var pjson = require('../package.json');

var FFmpeg = function () {
  function FFmpeg(opts) {
    _classCallCheck(this, FFmpeg);

    this.opts = Object.assign({ // eslint-disable-line prefer-object-spread
      numOfChannels: 2,
      sampleRate: 44100,
      userAgent: 'KDGM_WaveformGenerator/' + pjson.version + ' (https://kerkdienstgemist.nl)'
    }, opts || {});
  }

  _createClass(FFmpeg, [{
    key: 'isURL',
    value: function isURL(input) {
      try {
        new URL(input); // eslint-disable-line no-new
      } catch (e) {
        if (e.name === 'TypeError [ERR_INVALID_URL]') {
          return false;
        }
        throw e;
      }
      return true;
    }
  }, {
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
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var errorMsg = '';
        var remuxfilepath = path.join(tmpPath, 'remux.mp3');
        var userAgentArgument = _this2.isURL(input) ? ['-user_agent', _this2.opts.userAgent] : [];
        var ffmpeg = spawn('ffmpeg', ['-v', 'error'].concat(userAgentArgument, ['-i', input, '-c:a', 'copy', '-y', remuxfilepath]));
        ffmpeg.stderr.on('data', function (err) {
          errorMsg += err.toString();
        });
        ffmpeg.on('close', function (exitCode) {
          if (exitCode) {
            reject(new Error(errorMsg));
          } else {
            resolve(remuxfilepath);
          }
        });
      });
    }
  }, {
    key: 'ffmpegAudioToRaw',
    value: function ffmpegAudioToRaw(input, tmpPath) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var errorMsg = '';
        var rawfilepath = path.join(tmpPath, 'audio.raw');
        var ffmpeg = spawn('ffmpeg', ['-v', 'error', '-i', input, '-ac', _this3.opts.numOfChannels, '-ar', _this3.opts.sampleRate, '-f', 's16le', '-y', rawfilepath]);
        ffmpeg.stderr.on('data', function (err) {
          errorMsg += err.toString();
        });
        ffmpeg.on('close', function (exitCode) {
          if (exitCode) {
            reject(new Error(errorMsg));
          } else {
            resolve(rawfilepath);
          }
        });
      });
    }
  }]);

  return FFmpeg;
}();

module.exports = FFmpeg;

// https://github.com/t4nz/ffmpeg-peaks/commit/2cb0fb03e2ef9b490691c2b40da218ff82e79219

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