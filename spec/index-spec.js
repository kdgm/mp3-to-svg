const fs = require('fs');
const glob = require('glob');
const chai = require('chai');
const expect = chai.expect;
const convertMP3toSVG = require('../src/index.js');

describe('Main', function() {
  context('mainly', function() {

    afterEach(function(){
      let files = glob.sync('spec/**/*.svg');
      files.forEach( (file) => {
        fs.unlinkSync(file);
      });
    });

    it('should create one SVG file from an audio file', async function() {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'spec/fixtures/test.svg', [400]);
      expect(fs.existsSync('spec/fixtures/test400.svg')).to.be.true;
    });

    it('should create two SVG files from an audio file', async function() {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'spec/fixtures/test.svg', [100, 400]);
      expect(fs.existsSync('spec/fixtures/test400.svg')).to.be.true;
      expect(fs.existsSync('spec/fixtures/test100.svg')).to.be.true;
    });

    it('should create two SVG files from an audio file', async function() {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'spec/fixtures/test.svg', [400]);
      await fs.stat('spec/fixtures/test400.svg', (err, stats) => {
        expect(stats.size).to.equal(10046);
      });
    });

  });
});
