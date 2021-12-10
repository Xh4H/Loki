'use strict'

import fs from 'fs'
import pack from 'libnpmpack'
import { publish } from 'libnpmpublish'

// npmjs default registry
const OPTS = {
    registry: 'https://registry.npmjs.org/'
}

class PackageManager {
    constructor({ pkg, version, directory, token }) {
        this.pkg = pkg
        this.version = version
        this.loki_directory = `${directory}/_loki_packages`
        this.directory = `${this.loki_directory}/${this.pkg}`
        this.token = token
    }

    async impersonatePackage() {
        fs.mkdirSync(this.directory, { recursive: true })

        const package_json = JSON.stringify({
            name: this.pkg,
            version: this.version,
            private: false
        })
        fs.writeFileSync(`${this.directory}/package.json`, package_json)

        const index_js = `console.log('this is a test')`
        fs.writeFileSync(`${this.directory}/index.js`, index_js)

        const manifest = {
            name: this.pkg,
            version: this.version,
            description: 'Loki automation package'
        }
        const tarData = await pack(`file:${this.directory}`, { ...OPTS})

        return {
            manifest,
            job: publish(manifest, tarData, {
                ...OPTS,
                npmVersion: this.version,
                forceAuth: {
                    token: this.token
                }
            })
        }
    }
}

export default PackageManager
