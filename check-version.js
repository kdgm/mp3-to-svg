import semver from 'semver'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get directory name in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))

// Read package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, './package.json'), 'utf8'))
const { engines } = packageJson

// check engines.node.version
const requiredNodeVersion = engines.node
const actualNodeVersion = process.version

if (!semver.satisfies(actualNodeVersion, requiredNodeVersion)) {
    console.log(
        `Required node version ${requiredNodeVersion} not satisfied with current version ${actualNodeVersion}.`
    )
    process.exit(1)
}
