const path = require('path');
const { spawn } = require('child_process');
const { URL } = require('url');
const pjson = require('../package.json');

class FFmpeg {
  constructor(opts) {
    this.opts = Object.assign({ // eslint-disable-line prefer-object-spread
      numOfChannels: 2,
      sampleRate: 44100,
      userAgent: `KDGM_WaveformGenerator/${pjson.version} (https://kerkdienstgemist.nl)`,
    }, opts || {});
  }

  isURL(input) {
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

  audioToRaw(input, tmpPath) {
    return this.ffmpegAudioRemux(input, tmpPath)
      .then((remuxedFile) => this.ffmpegAudioToRaw(remuxedFile, tmpPath));
  }

  ffmpegAudioRemux(input, tmpPath) {
    return new Promise((resolve, reject) => {
      let errorMsg = '';
      const remuxfilepath = path.join(tmpPath, 'remux.mp3');
      const userAgentArgument = this.isURL(input) ? ['-user_agent', this.opts.userAgent] : [];
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        ...userAgentArgument,
        '-i', input,
        '-c:a', 'copy',
        '-y', remuxfilepath,
      ]);
      ffmpeg.stderr.on('data', (err) => { errorMsg += err.toString(); });
      ffmpeg.on('close', (exitCode) => {
        if (exitCode) {
          reject(new Error(errorMsg));
        } else {
          resolve(remuxfilepath);
        }
      });
    });
  }

  ffmpegAudioToRaw(input, tmpPath) {
    return new Promise((resolve, reject) => {
      let errorMsg = '';
      const rawfilepath = path.join(tmpPath, 'audio.raw');
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        '-i', input,
        '-ac', this.opts.numOfChannels,
        '-ar', this.opts.sampleRate,
        '-f', 's16le',
        '-y', rawfilepath,
      ]);
      ffmpeg.stderr.on('data', (err) => { errorMsg += err.toString(); });
      ffmpeg.on('close', (exitCode) => {
        if (exitCode) {
          reject(new Error(errorMsg));
        } else {
          resolve(rawfilepath);
        }
      });
    });
  }
}

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
