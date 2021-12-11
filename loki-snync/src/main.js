'use strict';

import RepoManager from './RepoManager.js';
import Parser from './Parser.js';
import RegistryClient from './RegistryClient.js';

async function testProject({ projectPath, log, debugMode, privatePackagesList = [] }) {
    const registryClient = new RegistryClient();
    const repoManager = new RepoManager({ directoryPath: projectPath });

    const parser = new Parser({
        directoryPath: projectPath,
        manifestType: 'npm'
    });

    const allDependencies = parser.getDependenciesFromManifest();
    const { nonScopedDependencies } = parser.classifyScopedDependencies(allDependencies);
    // @TODO warn the user about `scopedDeps` and `scopedDependencies` to make sure they own it

    log('Reviewing your dependencies...');

    const snapshots = repoManager.getFileSnapshots({ filepath: 'package.json' });
    const earliestSnapshotPerDependency = parser.getEarliestSnapshotPerDependency({ snapshots });

    // Make all requests in parallel and await later when it needed
    const packagesMetadataRequests = nonScopedDependencies.reduce((acc, dependency) => {
        acc[dependency] = registryClient.getPackageMetadataFromRegistry({
            packageName: dependency
        });
        return acc;
    }, {});

    const results = {};
    for (const dependency of nonScopedDependencies) {
        log(`Checking dependency: ${dependency}`);

        const packageMetadataFromRegistry = await packagesMetadataRequests[dependency];
        const timestampOfPackageInSource = earliestSnapshotPerDependency[dependency]
            ? earliestSnapshotPerDependency[dependency].ts
            : Date.now(); // If a dependency is not in the git history (just added in the working copy)

        let timestampOfPackageInRegistry;
        if (packageMetadataFromRegistry && packageMetadataFromRegistry.error === 'Not found') {
            timestampOfPackageInRegistry = null;
        } else {
            // npmjs keeps time.created always in UTC, it's a ISO 8601 time format string
            timestampOfPackageInRegistry = new Date(packageMetadataFromRegistry.time.created).getTime();
        }

        const isPrivatePackage = privatePackagesList.includes(dependency);

        // @TODO add debug for:
        // console.log('package in source UTC:   ', timestampInSource)
        // console.log('package in registry:     ', timestampOfPackageInRegistry)

        const status = resolveDependencyConfusionStatus({
            isPrivatePackage,
            timestampOfPackageInSource,
            timestampOfPackageInRegistry
        });

        if (status) {
            results[dependency] = status.match(/.*(vulnerable|suspicious)/)[1];
        } else {
            log(`${dependency} does not seem to be vulnerable.`);
        }

        if (debugMode && earliestSnapshotPerDependency[dependency]) {
            log('  -> introduced via commit sha: ' + earliestSnapshotPerDependency[dependency].hash);
        }
    }
    log('Scanning suspicious packages ...');
    return results;
}

function resolveDependencyConfusionStatus({
    isPrivatePackage,
    timestampOfPackageInSource,
    timestampOfPackageInRegistry
}) {
    let status = null;

    // if timestampOfPackageInRegistry exists and has
    // numeric values then the package exists in the registry
    if (timestampOfPackageInRegistry > 0) {
        const timeDiff = timestampOfPackageInSource - timestampOfPackageInRegistry;
        if (timeDiff < 0) {
            // this means that the package was first introduced to source code
            // and now there's also a package of this name in a public registry
            status = '❌ suspicious';
        } else {
            if (isPrivatePackage) {
                status = '❌ suspicious';
            }
        }
    } else {
        status = '⚠️ vulnerable';
    }

    return status;
}

export { testProject };
