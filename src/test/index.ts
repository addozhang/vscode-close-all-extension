/**
 * Test suite entry file - Optimize test execution order and environment setup
 */

import * as path from 'path';

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.EXTENSION_ID = 'addozhang.close-all';

// Import all test files
import './extension.test';
import './verification.test';
import './integration.test';
import './force-close.test';

// Set up global test configuration
before(async function() {
    console.log('🚀 Setting up test environment...');

    // Set longer timeout
    this.timeout(30000);

    // Wait for extension to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));
});

after(async function() {
    console.log('🧹 Cleaning up test environment...');

    // Clean up test environment
    try {
        const vscode = require('vscode');
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    } catch (error) {
        console.warn('Cleanup warning:', error);
    }
});

console.log('🎯 Test suite initialized successfully');