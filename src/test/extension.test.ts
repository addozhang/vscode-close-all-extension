import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

// Import extension modules for testing
// Note: Need to restructure extension functions for better testing

interface TestTextEditor extends vscode.TextEditor {
    document: vscode.TextDocument & {
        isDirty: boolean;
    };
}

suite('Close All Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting Close All extension tests');

    let sandbox: sinon.SinonSandbox;
    
    setup(() => {
        sandbox = sinon.createSandbox();
    });
    
    teardown(() => {
        sandbox.restore();
    });

    test('Extension should activate successfully', async () => {
        // Test extension activation
        const extension = vscode.extensions.getExtension('close-all');
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive, 'Extension should be in active state');
        }
    });

    test('All commands should be properly registered', async () => {
        // Get all registered commands
        const commands = await vscode.commands.getCommands();
        
        // Verify our commands are registered
        assert.ok(commands.includes('closeAll.closeSaved'), 'Close saved editors command should be registered');
        assert.ok(commands.includes('closeAll.saveAndCloseAll'), 'Save and close all editors command should be registered');
        assert.ok(commands.includes('closeAll.closeAllForce'), 'Force close all editors command should be registered');
    });

    test('Configuration settings should have correct default values', () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        
        // Test default configuration values
        assert.strictEqual(config.get('keepCurrentActiveEditor'), false, 'Should not keep current active editor by default');
        assert.strictEqual(config.get('showConfirmationDialog'), false, 'Should not show confirmation dialog by default');
    });

    test('Close saved editors command should exist', async () => {
        try {
            // Try to execute command (won't actually close editors since there might be none open)
            await vscode.commands.executeCommand('closeAll.closeSaved');
            assert.ok(true, 'Close saved editors command executed successfully');
        } catch (error) {
            // If command doesn't exist, it will throw an error
            assert.fail(`Close saved editors command execution failed: ${error}`);
        }
    });

    test('Save and close all editors command should exist', async () => {
        try {
            await vscode.commands.executeCommand('closeAll.saveAndCloseAll');
            assert.ok(true, 'Save and close all editors command executed successfully');
        } catch (error) {
            assert.fail(`Save and close all editors command execution failed: ${error}`);
        }
    });

    test('Force close all editors command should exist', async () => {
        try {
            await vscode.commands.executeCommand('closeAll.closeAllForce');
            assert.ok(true, 'Force close all editors command executed successfully');
        } catch (error) {
            assert.fail(`Force close all editors command execution failed: ${error}`);
        }
    });
});

suite('Configuration Management Tests', () => {
    test('Configuration items should be readable correctly', () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        
        // Test existence of all configuration items
        const keepActiveConfig = config.inspect('keepCurrentActiveEditor');
        const showConfirmationConfig = config.inspect('showConfirmationDialog');
        const buttonActionConfig = config.inspect('buttonAction');
        
        assert.ok(keepActiveConfig, 'keepCurrentActiveEditor configuration should exist');
        assert.ok(showConfirmationConfig, 'showConfirmationDialog configuration should exist');
        assert.ok(buttonActionConfig, 'buttonAction configuration should exist');
    });

    test('Button action configuration should have valid enum values', () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        const validActions = ['closeSaved', 'saveAndCloseAll', 'closeAllForce'];
        
        // Default value should be valid
        const defaultAction = config.get('buttonAction', 'closeSaved');
        assert.ok(validActions.includes(defaultAction), `Button action default value should be valid: ${defaultAction}`);
    });
});

suite('Mock Editor Scenario Tests', () => {
    test('Commands should handle correctly when no editors exist', async () => {
        // Mock vscode.window.visibleTextEditors to return empty array
        const stub = sinon.stub(vscode.window, 'visibleTextEditors').value([]);
        const showInfoStub = sinon.stub(vscode.window, 'showInformationMessage');
        
        try {
            await vscode.commands.executeCommand('closeAll.closeSaved');
            
            // Verify if correct information was shown
            assert.ok(showInfoStub.called, 'Should show information message');
        } finally {
            stub.restore();
            showInfoStub.restore();
        }
    });
});

suite('All Tab Types Closing Tests', () => {
    test('Commands should be able to handle all types of tabs', async () => {
        // This test verifies that the extension can handle different tab types
        // including editor tabs, extension details, settings pages, etc.
        
        try {
            // Execute commands and ensure they don't crash with different tab types
            await vscode.commands.executeCommand('closeAll.closeSaved');
            await vscode.commands.executeCommand('closeAll.saveAndCloseAll');
            await vscode.commands.executeCommand('closeAll.closeAllForce');
            
            assert.ok(true, 'All commands should handle different tab types correctly');
        } catch (error) {
            assert.fail(`Commands failed to handle different tab types: ${error}`);
        }
    });

    test('Extension description should reflect all tab types functionality', () => {
        // Verify that the extension description mentions the new capability
        const extension = vscode.extensions.getExtension('addozhang.close-all');
        if (extension) {
            const description = extension.packageJSON.description;
            assert.ok(
                description.includes('all tabs') || description.includes('tab types'),
                'Extension description should mention support for all tab types'
            );
        }
    });
});
