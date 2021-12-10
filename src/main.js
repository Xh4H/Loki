'use strict'

import fs from 'fs'
import chalk from "chalk"
import Nm from './npm-api.js' // Nm as NPM-API manager

let manager

function log(message) {
    if (!message) return;
    console.log(chalk.rgb(247, 30, 56)('[Loki]'), message)
}

function getVersion(pkg) {
    const matches = pkg.match(/(\d+\.\d+\.\d+)/);
    return matches ? matches[1] : '1.0.0'; // default to 1.0.0
}

async function getProfile() {
    try {
        return await manager.getProfile()
    } catch (err) {
        console.log(err)
    }
}

function createPackage(pkg, version) {
    return manager.createPackage(pkg, version) // return the promise
}

function handleSubmissions(submissions) {
    Promise.all(submissions).then(submission => {
        console.log("promise resolved")
        console.log(submission[0])
        console.log(submission[0].status)
        console.log(submission[0].response)
    })
}

async function setup({ pkgs, directory, entrypoint, accesstoken }) {
    manager = new Nm(accesstoken)
    const { dependencies } = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'))
    const is_valid_token = await manager.verifyToken()

    if (is_valid_token.error || !is_valid_token.success) {
        log('Token provided is not valid. Make sure it is not readonly.')
        process.exit(-1)
    }

    // verify that the token is valid and is available to retrieve data from npmjs
    await getProfile()

    // loop through the results
    let submissions = []
    for (const pkg in pkgs) {
        if (Object.prototype.hasOwnProperty.call(pkgs, pkg)) {
            const state = pkgs[pkg];

            if (state === 'vulnerable') {
                const target_version = getVersion(dependencies[pkg]);
                submissions.push(createPackage({
                    pkg,
                    directory,
                    version: target_version
                }))
            }

        }
    }

    handleSubmissions(submissions)
}

export { setup }
