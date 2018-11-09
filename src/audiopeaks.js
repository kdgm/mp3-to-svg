const fs = require('fs');

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
	 *		  For an AudioBuffer use AudioBuffer.length.
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
			for (let i=0; i<channels; i++) this.splitPeaks[i] = [];
		}

		for (let c = 0; c < channels; c++) {
			let peaks = this.splitPeaks[c];
			let chan = buffers[c];

			let i;
			for (i = this.indexI[c]; i < this.length; i++) {
				let start = Math.max(~~(i * sampleSize), this.indexJ[c]);
				let end = ~~((i+1) * sampleSize);
				let min = this.lastMin[c];
				let max = this.lastMax[c];

				let broken = false;
				let jj;
				for (let j = start; j < end; j += this.sampleStep) {
					jj = j - this.indexJ[c] + this.indexJJOverflow[c];

					if (jj > chan.length-1) {
						this.indexI[c] = i;
						this.indexJJOverflow[c] = jj - (chan.length-1) - 1;
						this.indexJ[c] = j;
						this.lastMax[c] = max;
						this.lastMin[c] = min;
						broken = true;
						break;
					}

					let value = chan[jj];

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

				if (c == 0 || max > this.mergedPeaks[2 * i]) {
					this.mergedPeaks[2 * i] = max;
				}

				if (c == 0 || min < this.mergedPeaks[2 * i + 1]) {
					this.mergedPeaks[2 * i + 1] = min;
				}
			}

			this.indexI[c] = i;  // We finished for channel c. For the next call start from i = this.length so we do nothing.
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

		this.opts = Object.assign({
			numOfChannels: 2,
			sampleRate: 44100,
			maxValue: 1.0,
			minValue: -1.0,
			width: 100,
			precision: 1
		}, opts || {});
	}

  getPeaks(rawAudioFile){
    return this.getPeaksFromRawAudioFile(rawAudioFile);
  }

  getPeaksFromRawAudioFile(rawAudioFile) {
    return new Promise( (resolve, reject) => {
      fs.stat(rawAudioFile, (err, stats) => {
		    if (err) reject(err);

        const totalSamples = ~~((stats.size / 2) / this.opts.numOfChannels);
				let peaks = new Peaks(this.opts.numOfChannels >= 2, this.opts.width, this.opts.precision, totalSamples);

				const readable = fs.createReadStream(rawAudioFile);
        readable.on('data',  (chunk) => { peaks.update(this.onChunkRead(chunk)); });
				readable.on('error', () => reject());
				readable.on('end',   () => resolve(peaks.get()[0]));
			});
		});
	}

	onChunkRead(chunk) {
		var i = 0;
		var value;
		var samples = [];

		for (let ii=0; ii<this.opts.numOfChannels; ii++) samples[ii] = [];

		if (this.oddByte !== null) {
			value = ((chunk.readInt8(i++, true) << 8) | this.oddByte) / 32768.0;
			samples[this.sc].push(value);
			this.sc = (this.sc+1) % this.opts.numOfChannels;
		}

		for (; i+1 < chunk.length; i += 2) {
			value = chunk.readInt16LE(i, true) / 32768.0;
			samples[this.sc].push(value);
			this.sc = (this.sc+1) % this.opts.numOfChannels;
		}
		this.oddByte = ( i < chunk.length ? chunk.readUInt8(i, true) : null);
	  return samples;
	}
}

module.exports = AudioPeaks
