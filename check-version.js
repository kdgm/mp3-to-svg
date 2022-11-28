const semver = require('semver');
const { exec } = require('child_process');
const { engines } = require('./package.json');

// check engines.node.version
const requiredNodeVersion = engines.node;
const actualNodeVersion = process.version;
if (!semver.satisfies(actualNodeVersion, requiredNodeVersion)) {
  console.log(`Required node version ${requiredNodeVersion} not satisfied with current version ${actualNodeVersion}.`);
  process.exit(1);
}

// check engines.npm.version
const requiredNpmVersion = engines.npm;
exec(
  'npm -v',
  (error, stdout) => {
    const actualNpmVersion = stdout;
    if (!semver.satisfies(actualNpmVersion, requiredNpmVersion)) {
      console.log(`Required node version ${requiredNpmVersion} not satisfied with current version ${actualNpmVersion}.`);
      process.exit(1);
    }
  },
);
