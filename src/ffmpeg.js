const path  = require('path');
const spawn = require('child_process').spawn;

class FFmpeg {

  audioToRaw(input, tmpPath){
    return new Promise((resolve, reject) => {
      this.ffmpegAudioRemux(input, tmpPath)
        .then(remuxedFile => this.ffmpegAudioToRaw(remuxedFile, tmpPath))
        .then(convertedFile => resolve(convertedFile))
        .catch(err => reject(err));
    });
  }

  ffmpegAudioRemux(input, tmpPath) {
    return new Promise((resolve, reject) => {
      var errorMsg = '';
      const remuxfilepath = path.join(tmpPath, 'remux.mp3');
      const ffmpeg = spawn('ffmpeg', [
        '-v', 'error',
        '-i', input,
        '-c:a', 'copy',
        '-y', remuxfilepath
      ]);
      ffmpeg.stdout.on('end',  ()    => resolve(remuxfilepath));
      ffmpeg.stderr.on('data', (err) => errorMsg += err.toString());
      ffmpeg.stderr.on('end',  ()    => { if (errorMsg) reject(new Error(errorMsg)); });
    });
  }

  ffmpegAudioToRaw(input, tmpPath) {
    return new Promise((resolve, reject) => {
      var errorMsg = '';
  		const rawfilepath = path.join(tmpPath, 'audio.raw');
  		const ffmpeg = spawn('ffmpeg', [
  			'-v', 'error',
  			'-i', input,
  			'-f', 's16le',
  			'-ac', 2,
  			'-acodec', 'pcm_s16le',
  			'-ar', '11025',
  			'-y', rawfilepath
  		]);
  		ffmpeg.stdout.on('end',  ()    => resolve(rawfilepath));
  		ffmpeg.stderr.on('data', (err) => errorMsg += err.toString());
  		ffmpeg.stderr.on('end',  ()    => { if (errorMsg) reject(new Error(errorMsg)); });
    });
	};
}

module.exports = FFmpeg;
