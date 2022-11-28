const Svgo = require('svgo');

class SvgCreator {
  constructor(numberOfSamples) {
    this.numberOfSamples = numberOfSamples;
    this.svgo = new Svgo({
      plugins: [
        { removeUnknownsAndDefaults: false },
        { convertPathData: false },
      ],
    });
  }

  buildSVG(path, numberOfSamples) {
    return new Promise((resolve) => {
      const tempsvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg preserveAspectRatio="none" viewBox="0 -1 ${numberOfSamples} 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;"><path stroke-width="0.7" stroke="#7cb584" d="${path}" fill="none" height="100%" width="100%" x="0" y="0" /></svg>`;
      resolve(tempsvg);
    });
  }

  svgPath(peaks) {
    return new Promise((resolve) => {
      if (peaks) {
        const totalPeaks = peaks.length;
        let d = '';
        for (let peakNumber = 0; peakNumber < totalPeaks; peakNumber += 1) {
          if (peakNumber % 2 === 0) {
            // eslint-disable-next-line no-bitwise
            d += ` M${~~(peakNumber / 2)}, ${peaks.shift().toFixed(3)}`;
          } else {
            // eslint-disable-next-line no-bitwise
            d += ` L${~~(peakNumber / 2)}, ${peaks.shift().toFixed(3)}`;
          }
        }
        resolve(d);
      }
    });
  }

  peaksToSvg(peaks) {
    return this.svgPath(peaks)
      .then((path) => this.buildSVG(path, this.numberOfSamples))
      .then((data) => this.svgo.optimize(data));
  }
}

module.exports = SvgCreator;

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
