/* eslint-env mocha */
/* eslint-disable prefer-arrow-callback, func-names, no-unused-expressions */
const fs = require('fs');
const glob = require('glob');
const { expect } = require('chai');
const convertMP3toSVG = require('../src/index.js');


describe('Main', function () {
  context('mainly', function () {
    afterEach(function () {
      const files = glob.sync('tmp/*.svg');
      files.forEach((file) => {
        fs.unlinkSync(file);
      });
    });

    it('should create one SVG file from an audio file', async function () {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'tmp/test.svg', [400]);
      expect(fs.existsSync('tmp/test400.svg')).to.be.true;
    });

    it('should create two SVG files from an audio file', async function () {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'tmp/test.svg', [100, 400]);
      expect(fs.existsSync('tmp/test400.svg')).to.be.true;
      expect(fs.existsSync('tmp/test100.svg')).to.be.true;
    });

    it('should create two SVG files from an audio file', async function () {
      await convertMP3toSVG('spec/fixtures/test.mp3', 'tmp/test.svg', [400]);
      await fs.stat('tmp/test400.svg', (err, stats) => {
        expect(stats.size).to.equal(10046);
      });
    });
  });
});
