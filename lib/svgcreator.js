'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Svgo = require('svgo');

var SvgCreator = function () {
  function SvgCreator(numberOfSamples) {
    _classCallCheck(this, SvgCreator);

    this.numberOfSamples = numberOfSamples;
    this.svgo = new Svgo({ plugins: [{ removeUnknownsAndDefaults: false }, { convertPathData: false }] });
  }

  _createClass(SvgCreator, [{
    key: 'buildSVG',
    value: function buildSVG(path, numberOfSamples) {
      return new Promise(function (resolve, reject) {
        var tempsvg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg preserveAspectRatio="none" viewBox="0 -1 ' + numberOfSamples + ' 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;"><path stroke-width="0.7" stroke="#000" d="' + path + '" fill="none" height="100%" width="100%" x="0" y="0" /></svg>';
        resolve(tempsvg);
      });
    }
  }, {
    key: 'svgPath',
    value: function svgPath(peaks) {
      return new Promise(function (resolve, reject) {
        if (peaks) {
          var totalPeaks = peaks.length;
          var d = '';
          for (var peakNumber = 0; peakNumber < totalPeaks; peakNumber++) {
            if (peakNumber % 2 === 0) {
              d += ' M' + ~~(peakNumber / 2) + ', ' + peaks.shift();
            } else {
              d += ' L' + ~~(peakNumber / 2) + ', ' + peaks.shift();
            }
          }
          resolve(d);
        }
      });
    }
  }, {
    key: 'peaksToSvg',
    value: function peaksToSvg(peaks) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.svgPath(peaks).then(function (path) {
          return _this.buildSVG(path, _this.numberOfSamples);
        }).then(function (data) {
          return _this.svgo.optimize(data);
        }).then(function (svg) {
          return resolve(svg.data);
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }]);

  return SvgCreator;
}();

module.exports = SvgCreator;