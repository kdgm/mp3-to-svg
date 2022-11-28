const fs = require('fs');

/* eslint max-classes-per-file: ["error", 2] */

class Peaks {
  constructor(splitChannels, length, step, totalSamples) {
    this.length = length;
    this.totalSamples = totalSamples;
    this.splitChannels = splitChannels;
    this.sampleStep = step;
    this.mergedPeaks = [];
  }

  /**
   * Compute the max and min value of the waveform when broken into
   * <length> subranges.
   * @param {buffers} buffers[i] is an array of floats containing the samples of channel i.
   * @param {length} How many subranges to break the waveform into.
   * @param {totalSamples} How many samples there are in the whole audio.
   *    For an AudioBuffer use AudioBuffer.length.
   * @param {firstCall} Set this always to true.
   * @returns {Array} Array of 2*<length> peaks or array of arrays
   * of peaks consisting of (max, min) values for each subrange.
   */
  update(buffers) {
    const sampleSize = this.totalSamples / this.length;
    const channels = buffers.length;

    if (this.lastMax === undefined) {
      this.lastMax = Array(channels).fill(0);
      this.lastMin = Array(channels).fill(0);
      this.indexI = Array(channels).fill(0);
      this.indexJ = Array(channels).fill(0);
      this.indexJJOverflow = Array(channels).fill(0);
      this.splitPeaks = [];
      for (let i = 0; i < channels; i += 1) this.splitPeaks[i] = [];
    }

    for (let c = 0; c < channels; c += 1) {
      const peaks = this.splitPeaks[c];
      const chan = buffers[c];

      let i;
      for (i = this.indexI[c]; i < this.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        const start = Math.max(~~(i * sampleSize), this.indexJ[c]);
        // eslint-disable-next-line no-bitwise
        const end = ~~((i + 1) * sampleSize);
        let min = this.lastMin[c];
        let max = this.lastMax[c];

        let broken = false;
        let jj;
        for (let j = start; j < end; j += this.sampleStep) {
          jj = j - this.indexJ[c] + this.indexJJOverflow[c];

          if (jj > chan.length - 1) {
            this.indexI[c] = i;
            this.indexJJOverflow[c] = jj - (chan.length - 1) - 1;
            this.indexJ[c] = j;
            this.lastMax[c] = max;
            this.lastMin[c] = min;
            broken = true;
            break;
          }

          const value = chan[jj];

          if (value > max) {
            max = value;
          }

          if (value < min) {
            min = value;
          }
        }

        if (broken) break;
        else {
          this.lastMax[c] = 0;
          this.lastMin[c] = 0;
        }

        peaks[2 * i] = max;
        peaks[2 * i + 1] = min;

        if (c === 0 || max > this.mergedPeaks[2 * i]) {
          this.mergedPeaks[2 * i] = max;
        }

        if (c === 0 || min < this.mergedPeaks[2 * i + 1]) {
          this.mergedPeaks[2 * i + 1] = min;
        }
      }

      // We finished for channel c. For the next call start from i = this.length so we do nothing.
      this.indexI[c] = i;
    }
  }

  get() {
    return this.splitChannels ? this.splitPeaks : this.mergedPeaks;
  }
}

class AudioPeaks {
  constructor(opts) {
    this.oddByte = null;
    this.sc = 0;

    this.opts = Object.assign({ // eslint-disable-line prefer-object-spread
      numOfChannels: 2,
      maxValue: 1.0,
      minValue: -1.0,
      width: 100,
      precision: 1,
    }, opts || {});
  }

  getPeaks(rawAudioFile) {
    return new Promise((resolve, reject) => {
      fs.stat(rawAudioFile, (err, stats) => {
        if (err) reject(err);

        // eslint-disable-next-line no-bitwise
        const totalSamples = ~~((stats.size / 2) / this.opts.numOfChannels);
        const peaks = new Peaks(
          this.opts.numOfChannels >= 2,
          this.opts.width,
          this.opts.precision,
          totalSamples,
        );

        const readable = fs.createReadStream(rawAudioFile);
        readable.on('data', (chunk) => { peaks.update(this.onChunkRead(chunk)); });
        readable.on('error', () => reject());
        readable.on('end', () => resolve(peaks.get()));
      });
    });
  }

  onChunkRead(chunk) {
    let i = 0;
    let value;
    const samples = [];

    for (let ii = 0; ii < this.opts.numOfChannels; ii += 1) samples[ii] = [];

    if (this.oddByte !== null) {
      // eslint-disable-next-line no-bitwise
      value = ((chunk.readInt8(i += 1, true) << 8) | this.oddByte) / 32768.0;
      samples[this.sc].push(value);
      this.sc = (this.sc + 1) % this.opts.numOfChannels;
    }

    for (; i + 1 < chunk.length; i += 2) {
      value = chunk.readInt16LE(i, true) / 32768.0;
      samples[this.sc].push(value);
      this.sc = (this.sc + 1) % this.opts.numOfChannels;
    }
    this.oddByte = (i < chunk.length ? chunk.readUInt8(i, true) : null);
    return samples;
  }
}

module.exports = AudioPeaks;

// https://github.com/invokemedia/audio-to-svg-waveform/commit/a78b5e47203fc62add497340ec6f8e74a4db68f7

// MIT License
//
// Copyright (c) 2017 Invoke Media
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
