const path = require('path');
const { spawn } = require('child_process');

class FFmpeg {
  constructor(opts) {
    this.opts = Object.assign({
      numOfChannels: 2,
      sampleRate: 44100,
    }, opts || {});
  }

  audioToRaw(input, tmpPath) {
    return this.ffmpegAudioRemux(input, tmpPath)
      .then(remuxedFile => this.ffmpegAudioToRaw(remuxedFile, tmpPath));
  }

  ffmpegAudioRemux(input, tmpPath) {
    return new Promise((resolve, reject) => {
      let errorMsg = '';
      const remuxfilepath = path.join(tmpPath, 'remux.mp3');
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        '-i', input,
        '-c:a', 'copy',
        '-y', remuxfilepath,
      ]);
      ffmpeg.stdout.on('end', () => resolve(remuxfilepath));
      ffmpeg.stderr.on('data', (err) => { errorMsg += err.toString(); });
      ffmpeg.stderr.on('end', () => { if (errorMsg) reject(new Error(errorMsg)); });
    });
  }

  ffmpegAudioToRaw(input, tmpPath) {
    return new Promise((resolve, reject) => {
      let errorMsg = '';
      const rawfilepath = path.join(tmpPath, 'audio.raw');
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        '-i', input,
        '-f', 's16le',
        '-ac', this.opts.numOfChannels,
        '-acodec', 'pcm_s16le',
        '-ar', this.opts.sampleRate,
        '-y', rawfilepath,
      ]);
      ffmpeg.stdout.on('end', () => resolve(rawfilepath));
      ffmpeg.stderr.on('data', (err) => { errorMsg += err.toString(); });
      ffmpeg.stderr.on('end', () => { if (errorMsg) reject(new Error(errorMsg)); });
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
