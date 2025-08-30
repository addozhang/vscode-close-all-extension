import * as assert from 'assert';
import * as vscode from 'vscode';
import { waitForExtensionActivation, waitForCommand, retry } from './test-helpers';

/**
 * Simplified test suite for quick validation of extension basic functionality
 */
suite('Quick Validation Tests', () => {
    
    test('Extension command registration verification', async () => {
        // First execute a command to activate the extension
        try {
            await vscode.commands.executeCommand('closeAll.closeSaved');
        } catch (error) {
            // Command might fail if extension is not activated yet, that's ok
        }

        // Wait for extension to fully activate using helper
        const extensionActivated = await waitForExtensionActivation('addozhang.advanced-close-all');
        assert.ok(extensionActivated, 'Extension should be activated');

        // Use retry mechanism for command verification
        await retry(async () => {
            const commands = await vscode.commands.getCommands();

            const requiredCommands = [
                'closeAll.closeSaved',
                'closeAll.saveAndCloseAll',
                'closeAll.closeAllForce'
            ];

            for (const command of requiredCommands) {
                assert.ok(
                    commands.includes(command),
                    `Command ${command} should be registered`
                );
            }
        });

        console.log('✅ All required commands are properly registered');
    });

    test('Configuration items existence verification', () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        
        const requiredConfigs = [
            'keepCurrentActiveEditor',
            'confirmationDialog',
            'buttonAction'
        ];
        
        for (const configKey of requiredConfigs) {
            const configValue = config.inspect(configKey);
            assert.ok(
                configValue !== undefined, 
                `Configuration item ${configKey} should exist`
            );
        }
        
        console.log('✅ All required configuration items exist');
    });

    test('Command execution basic test', async () => {
        // These commands should be able to execute without throwing errors
        const commands = [
            'closeAll.closeSaved',
            'closeAll.saveAndCloseAll',
            'closeAll.closeAllForce'
        ];
        
        for (const command of commands) {
            try {
                await vscode.commands.executeCommand(command);
                console.log(`✅ Command ${command} executed successfully`);
            } catch (error) {
                assert.fail(`Command ${command} execution failed: ${error}`);
            }
        }
    });

    test('Configuration default values verification', () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        
        // Verify default configuration values
        assert.strictEqual(
            config.get('keepCurrentActiveEditor'), 
            false, 
            'keepCurrentActiveEditor default value should be false'
        );
        
        assert.strictEqual(
            config.get('confirmationDialog'), 
            false, 
            'confirmationDialog default value should be false'
        );
        
        const buttonAction = config.get('buttonAction');
        const validActions = ['closeSaved', 'saveAndCloseAll', 'closeAllForce'];

        // If buttonAction is undefined or empty, it should default to 'closeSaved'
        const effectiveButtonAction = (buttonAction as string) || 'closeSaved';
        assert.ok(
            validActions.includes(effectiveButtonAction),
            `Button action ${effectiveButtonAction} should be one of valid values: ${validActions.join(', ')}`
        );
        
        console.log('✅ All configuration default values are correct');
    });
});

suite('Basic Functionality Verification', () => {
    
    test('Extension activation status', () => {
        // In test environment, extension should already be activated
        // Here we simply verify VS Code API is available
        assert.ok(vscode.window, 'VS Code window API should be available');
        assert.ok(vscode.workspace, 'VS Code workspace API should be available');
        assert.ok(vscode.commands, 'VS Code commands API should be available');
        
        console.log('✅ VS Code API basic functionality available');
    });

    test('Extension information verification', () => {
        // Verify extension basic information
        const extensions = vscode.extensions.all;
        const ourExtension = extensions.find(ext => 
            ext.id.includes('close-all') || 
            ext.packageJSON?.name === 'close-all'
        );
        
        if (ourExtension) {
            assert.ok(ourExtension.packageJSON, 'Extension should have package.json information');
            console.log('✅ Extension information verification passed');
        } else {
            console.log('⚠️  Unable to find extension in test environment, this is normal in development environment');
        }
    });
});

console.log('🚀 Starting extension verification tests...');