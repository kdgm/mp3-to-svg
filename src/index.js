const fs         = require('fs');
const path       = require('path');
const Readable   = require('stream').Readable;
const rimraf     = require('rimraf');
require('./promise_finally_polyfill.js')
const ffmpeg     = new (require('./ffmpeg.js'))();
const AudioPeaks = require('./audiopeaks.js');
const SvgCreator = require('./svgcreator.js');

const input  = process.argv[2];
const output = process.argv[3];
const numberOfSamples = process.argv[4] || 100;
let tmpDir = '';

console.log('Start MP3 to SVG.....');
console.log("Input:", input);
console.log("Ouput:", output);
console.log("NumberOfSamples:", numberOfSamples);

const audioPeaks = new AudioPeaks({
  width: numberOfSamples,
	precision: 1,
	numOfChannels: 2,
	sampleRate: 11500
});
const svgCreator = new SvgCreator(numberOfSamples);

createTempDir()
  .then(dir => {
    tmpDir = dir;
    return ffmpeg.audioToRaw(input, tmpDir);
  })
  .then(rawAudioFile => audioPeaks.getPeaks(rawAudioFile))
  .then(peaks => svgCreator.peaksToSvg(peaks))
  .then(svg => writeToFile(svg, output))
  .then(() => console.log("Done."))
  .catch(e => {
    console.log('Could not convert file: ',e);
    process.exit(1);
  })
  .finally(() => removeDir(tmpDir));

function createTempDir() {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(path.join(__dirname, '../', 'tmp', 'ffpeaks-'), (err, tmpPath) => {
      if (err)
        reject(err);
      else {
        resolve(tmpPath);
      }
    });
  });
}

function writeToFile(data, filename) {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(data);
    readable.push(null);
    readable
      .pipe(fs.createWriteStream(filename))
      .on('finish', () => resolve())
      .on('error', err => reject(err));
  });
}

function removeDir(tmpDir) {
  return new Promise( (resolve, reject) => {
    rimraf(tmpDir, (err) => {
			if (err)
        reject(err);
      else
        resolve();
    });
  });
}
