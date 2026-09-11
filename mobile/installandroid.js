#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const sdkDependency = 'SalesforceMobileSDK-Android';
const sdkReference = packageJson.sdkDependencies[sdkDependency];
const [repository, commit] = sdkReference.split('#');
const targetDirectory = path.join('mobile_sdk', sdkDependency);
const cleanInstall = process.argv.includes('--clean');

if (!repository || !/^[0-9a-f]{40}$/i.test(commit ?? '')) {
    throw new Error(`${sdkDependency} must be pinned to a 40-character commit SHA.`);
}

function runGit(args, options = {}) {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'inherit', 'inherit'], ...options });
}

function installedCommit() {
    return execFileSync('git', ['-C', targetDirectory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

if (fs.existsSync(targetDirectory)) {
    let currentCommit;
    try {
        currentCommit = installedCommit();
    } catch {
        currentCommit = undefined;
    }

    if (currentCommit === commit) {
        console.log(`${targetDirectory} already contains ${commit}.`);
    } else if (!cleanInstall) {
        throw new Error(`${targetDirectory} does not contain ${commit}. Run node installandroid.js --clean to replace it.`);
    } else {
        fs.rmSync(targetDirectory, { recursive: true, force: true });
    }
}

if (!fs.existsSync(targetDirectory)) {
    console.log(`Installing ${sdkDependency} at ${commit}.`);
    fs.mkdirSync(path.dirname(targetDirectory), { recursive: true });
    runGit(['clone', '--depth', '1', '--no-checkout', repository, targetDirectory]);
    runGit(['-C', targetDirectory, 'fetch', '--depth', '1', 'origin', commit]);
    runGit(['-C', targetDirectory, 'checkout', '--detach', 'FETCH_HEAD']);
}

if (installedCommit() !== commit) {
    throw new Error(`${sdkDependency} checkout does not match the configured commit.`);
}

fs.rmSync(path.join(targetDirectory, 'hybrid'), { recursive: true, force: true });
fs.rmSync(path.join(targetDirectory, 'libs', 'test'), { recursive: true, force: true });
fs.rmSync(path.join(targetDirectory, 'libs', 'SalesforceReact', 'package.json'), { force: true });

