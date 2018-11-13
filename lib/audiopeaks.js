'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var Peaks = function () {
	function Peaks(splitChannels, length, step, totalSamples) {
		_classCallCheck(this, Peaks);

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
  *		  For an AudioBuffer use AudioBuffer.length.
  * @param {firstCall} Set this always to true.
  * @returns {Array} Array of 2*<length> peaks or array of arrays
  * of peaks consisting of (max, min) values for each subrange.
  */


	_createClass(Peaks, [{
		key: 'update',
		value: function update(buffers) {

			var sampleSize = this.totalSamples / this.length;
			var channels = buffers.length;

			if (this.lastMax === undefined) {
				this.lastMax = Array(channels).fill(0);
				this.lastMin = Array(channels).fill(0);
				this.indexI = Array(channels).fill(0);
				this.indexJ = Array(channels).fill(0);
				this.indexJJOverflow = Array(channels).fill(0);
				this.splitPeaks = [];
				for (var i = 0; i < channels; i++) {
					this.splitPeaks[i] = [];
				}
			}

			for (var c = 0; c < channels; c++) {
				var peaks = this.splitPeaks[c];
				var chan = buffers[c];

				var _i = void 0;
				for (_i = this.indexI[c]; _i < this.length; _i++) {
					var start = Math.max(~~(_i * sampleSize), this.indexJ[c]);
					var end = ~~((_i + 1) * sampleSize);
					var min = this.lastMin[c];
					var max = this.lastMax[c];

					var broken = false;
					var jj = void 0;
					for (var j = start; j < end; j += this.sampleStep) {
						jj = j - this.indexJ[c] + this.indexJJOverflow[c];

						if (jj > chan.length - 1) {
							this.indexI[c] = _i;
							this.indexJJOverflow[c] = jj - (chan.length - 1) - 1;
							this.indexJ[c] = j;
							this.lastMax[c] = max;
							this.lastMin[c] = min;
							broken = true;
							break;
						}

						var value = chan[jj];

						if (value > max) {
							max = value;
						}

						if (value < min) {
							min = value;
						}
					}

					if (broken) break;else {
						this.lastMax[c] = 0;
						this.lastMin[c] = 0;
					}

					peaks[2 * _i] = max;
					peaks[2 * _i + 1] = min;

					if (c == 0 || max > this.mergedPeaks[2 * _i]) {
						this.mergedPeaks[2 * _i] = max;
					}

					if (c == 0 || min < this.mergedPeaks[2 * _i + 1]) {
						this.mergedPeaks[2 * _i + 1] = min;
					}
				}

				this.indexI[c] = _i; // We finished for channel c. For the next call start from i = this.length so we do nothing.
			}
		}
	}, {
		key: 'get',
		value: function get() {
			return this.splitChannels ? this.splitPeaks : this.mergedPeaks;
		}
	}]);

	return Peaks;
}();

var AudioPeaks = function () {
	function AudioPeaks(opts) {
		_classCallCheck(this, AudioPeaks);

		this.oddByte = null;
		this.sc = 0;

		this.opts = Object.assign({
			numOfChannels: 2,
			sampleRate: 44100,
			maxValue: 1.0,
			minValue: -1.0,
			width: 100,
			precision: 1
		}, opts || {});
	}

	_createClass(AudioPeaks, [{
		key: 'getPeaks',
		value: function getPeaks(rawAudioFile) {
			return this.getPeaksFromRawAudioFile(rawAudioFile);
		}
	}, {
		key: 'getPeaksFromRawAudioFile',
		value: function getPeaksFromRawAudioFile(rawAudioFile) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				fs.stat(rawAudioFile, function (err, stats) {
					if (err) reject(err);

					var totalSamples = ~~(stats.size / 2 / _this.opts.numOfChannels);
					var peaks = new Peaks(_this.opts.numOfChannels >= 2, _this.opts.width, _this.opts.precision, totalSamples);

					var readable = fs.createReadStream(rawAudioFile);
					readable.on('data', function (chunk) {
						peaks.update(_this.onChunkRead(chunk));
					});
					readable.on('error', function () {
						return reject();
					});
					readable.on('end', function () {
						return resolve(peaks.get()[0]);
					});
				});
			});
		}
	}, {
		key: 'onChunkRead',
		value: function onChunkRead(chunk) {
			var i = 0;
			var value;
			var samples = [];

			for (var ii = 0; ii < this.opts.numOfChannels; ii++) {
				samples[ii] = [];
			}if (this.oddByte !== null) {
				value = (chunk.readInt8(i++, true) << 8 | this.oddByte) / 32768.0;
				samples[this.sc].push(value);
				this.sc = (this.sc + 1) % this.opts.numOfChannels;
			}

			for (; i + 1 < chunk.length; i += 2) {
				value = chunk.readInt16LE(i, true) / 32768.0;
				samples[this.sc].push(value);
				this.sc = (this.sc + 1) % this.opts.numOfChannels;
			}
			this.oddByte = i < chunk.length ? chunk.readUInt8(i, true) : null;
			return samples;
		}
	}]);

	return AudioPeaks;
}();

module.exports = AudioPeaks;