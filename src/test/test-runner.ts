#!/usr/bin/env node

/**
 * Custom test runner - Optimize test environment and execution order
 */

import { runTests } from '@vscode/test-electron';
import * as path from 'path';

async function main() {
    try {
        // Test execution configuration
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './test-runner');

        // Run tests
        await runTests({
            version: '1.103.2',
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--disable-extensions',
                '--disable-workspace-trust',
                '--user-data-dir=.vscode-test/user-data',
                '--extensions-dir=.vscode-test/extensions'
            ],
            extensionTestsEnv: {
                // Set test environment variables
                TEST_ENV: 'true',
                EXTENSION_ID: 'addozhang.close-all'
            }
        });

        console.log('✅ All tests completed successfully');
    } catch (err) {
        console.error('❌ Test run failed:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export { main as runTestSuite };