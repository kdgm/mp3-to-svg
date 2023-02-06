# MP3toSVG

This app can convert MP3 files to svg's with the waveform of the audio.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm), see .nvmrc for node version
* [ffmpeg] tested with version 4.0.1, likely to work with 3.x versions.

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* Then `npm install`

## Running / Development

* `npm run dev input.mp3 output.svg numberofsamples`

## Testing

* `npm test`

## Release

* `npm install`
* `npm build`
* Commit the new dist files
* `kdgm-release x.y.z`
