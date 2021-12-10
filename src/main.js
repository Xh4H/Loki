'use strict'

import fs from 'fs'
import Nm from './npm-api.js'
import chalk from "chalk"; // Nm as NPM-CLI manager
let manager

function log(message, status) {
    if (!message) return;
    console.log(chalk.rgb(247, 30, 56)(message, status))
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

async function setup({ pkgs, directory, entrypoint, accesstoken }) {
    manager = new Nm(accesstoken)
    const { dependencies } = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'))
    const is_valid_token = await manager.verifyToken()

    if (is_valid_token.error || !is_valid_token.success) {
        log('Token provided is not valid. Make sure it is not readonly.')
        process.exit(-1)
    }
    const data = await getProfile()
    // loop through the results
    for (const pkg in pkgs) {
        if (Object.prototype.hasOwnProperty.call(pkgs, pkg)) {
            const state = pkgs[pkg];
            const target_version = getVersion(dependencies[pkg]);
            console.log(state, target_version);
        }
    }
}

export { setup }
