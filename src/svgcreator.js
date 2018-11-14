const Svgo = require('svgo');

class SvgCreator {

  constructor(numberOfSamples) {
    this.numberOfSamples = numberOfSamples;
    this.svgo = new Svgo({ plugins: [{removeUnknownsAndDefaults: false}, {convertPathData: false}]});
  }

  buildSVG(path, numberOfSamples) {
    return new Promise((resolve, reject) => {
      const tempsvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg preserveAspectRatio="none" viewBox="0 -1 ${numberOfSamples} 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;"><path stroke-width="0.7" stroke="#39b54a" d="${path}" fill="none" height="100%" width="100%" x="0" y="0" /></svg>`;
      resolve(tempsvg);
    });
  }

  svgPath(peaks) {
    return new Promise((resolve, reject) => {
      if (peaks) {
        let totalPeaks = peaks.length;
        let d = '';
        for (let peakNumber = 0; peakNumber < totalPeaks; peakNumber++) {
          if (peakNumber % 2 === 0) {
            d += ' M' + ~~(peakNumber / 2) + ', ' + peaks.shift().toFixed(3);
          } else {
            d += ' L' + ~~(peakNumber / 2) + ', ' + peaks.shift().toFixed(3);
          }
        }
        resolve(d);
      }
    });
  }

  peaksToSvg(peaks) {
    return new Promise((resolve, reject) => {
      this.svgPath(peaks)
        .then(path => this.buildSVG(path, this.numberOfSamples) )
        .then(data => this.svgo.optimize(data))
        .then(svg  => resolve(svg.data))
        .catch(err => reject(err));
    });
  }

}

module.exports = SvgCreator;
