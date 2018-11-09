const fs = require('fs');
const path     = require('path');
const os       = require('os');
const rimraf   = require('rimraf');
const spawn    = require('child_process').spawn;

const sampleRate = 11025;
const numOfChannels = 2

class ffmpeg {

  audioToRaw(input, tmpPath){
    return new Promise((resolve, reject) => {
      console.log("audioToRaw", input);
      this.ffmpegAudioRemux(input, tmpPath)
        .then(remuxedFile => this.ffmpegAudioToRaw(remuxedFile, tmpPath))
        .then(convertedFile => resolve(convertedFile))
        .catch(err => {console.log('audioToRaw error', err); reject(err); })
    });
  }

  ffmpegAudioRemux(input, tmpPath) {
    return new Promise((resolve, reject) => {
      console.log("ffmpegAudioRemux", input, tmpPath);
      var errorMsg = '';
      const remuxfilepath = path.join(tmpPath, 'remux.mp3');
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        '-i', input,
        '-c:a', 'copy',
        '-y', remuxfilepath
      ]);
      ffmpeg.stdout.on('end',  ()    => { console.log('ffmpegAudioRemux end'); resolve(remuxfilepath); });
      ffmpeg.stderr.on('data', (err) => errorMsg += err.toString());
      ffmpeg.stderr.on('end',  ()    => { if (errorMsg) { console.log('ffmpegAudioRemux error', errorMsg); reject(new Error(errorMsg)); }});
    });
  }

  ffmpegAudioToRaw(input, tmpPath) {
    return new Promise((resolve, reject) => {
      console.log("ffmpegAudioToRaw start", input, tmpPath);
      var errorMsg = '';
  		const rawfilepath = path.join(tmpPath, 'audio.raw');
      console.log('writing to ', rawfilepath);
  		const ffmpeg = spawn('ffmpeg', [
  			'-v', 'error',
  			'-i', input,
  			'-f', 's16le',
  			'-ac', 2,
  			'-acodec', 'pcm_s16le',
  			'-ar', '11025',
  			'-y', rawfilepath
  		]);
  		ffmpeg.stdout.on('end',  ()    => { console.log('ffmpegAudioToRaw end'); resolve(rawfilepath); });
  		ffmpeg.stderr.on('data', (err) => errorMsg += err.toString());
  		ffmpeg.stderr.on('end',  ()    => { if (errorMsg) { console.log('ffmpegAudioToRaw error', errorMsg); reject(new Error(errorMsg)); }});
    });
	};
}

module.exports = ffmpeg;
