#!/usr/bin/env node
'use strict'

import { testProject as scan} from "../loki-snync/src/main.js";
import meow from 'meow'
import chalk from 'chalk'
const cli = meow(chalk.rgb(247, 30, 56)(`
  Usage
    $ loki [options]

  Options
    --directory   -d   Path to directory to scan
    --entrypoint  -e   [Optional defaults=index.js] Path to file to execute if directory is vulnerable (defaults to index.js)
    --inspect     -i   [Optional defaults=false]    Enable inspector mode
`), {
    importMeta: import.meta,
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
        }
    }
});

function log(message, status) {
    if (!message) return;
    console.log(chalk.rgb(247, 30, 56)(message, status))
}

async function start() {
    const { flags } = cli;
    const { directory, entrypoint } = flags;

    if (!directory) {
        console.error(cli.help);
        process.exit(-1);
    }
    //const { scan } = await import('./index');
    //const result = await scan(directory, input);
    //console.log(result);
    const result = await scan({
        projectPath: directory,
        log
    });
    if (Object.keys(result).length === 0) {
        log('No vulnerabilities found');
    } else {
        // loop through the results
        for (const pack in result) {
            if (Object.prototype.hasOwnProperty.call(result, pack)) {
                const state = result[pack];
                log(pack, state);
            }
        }
    }
    /*
    if (result.vulnerable) {
        log(`${chalk.rgb(247, 30, 56)('VULNERABLE!')} ${chalk.rgb(247, 30, 56)(`${result.vulnerable}`)}`);
        log(`${chalk.rgb(247, 30, 56)('EXECUTING:')} ${chalk.rgb(247, 30, 56)(`${entrypoint}`)}`);
        const { exec } = await import('child_process');
        exec(`node ${directory}/${entrypoint}`, {
            cwd: directory
        });
    } else {
        log(`${chalk.rgb(247, 30, 56)('NOT VULNERABLE!')}`);
    }
     */
    console.log(result)
}

start()
