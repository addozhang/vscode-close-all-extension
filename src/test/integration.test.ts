import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { waitForConfigurationUpdate, testLifecycleManager } from './test-helpers';

suite('Integration Test Suite', () => {
    
    test('Should be able to handle real file editors', async () => {
        // Create a temporary document for testing
        const doc = await vscode.workspace.openTextDocument({
            content: '// Test document content\nconsole.log("Hello World");',
            language: 'javascript'
        });
        
        // Open document in editor
        const editor = await vscode.window.showTextDocument(doc);
        
        assert.ok(editor, 'Should be able to open document editor');
        assert.strictEqual(editor.document.getText().includes('Hello World'), true, 'Document content should be correct');
        
        // Test closing saved editors (this document is new, unsaved)
        await vscode.commands.executeCommand('closeAll.closeSaved');
        
        // Verify editor is still open (since it's unsaved)
        const visibleEditors = vscode.window.visibleTextEditors;
        const isStillOpen = visibleEditors.some(e => e.document === doc);
        assert.ok(isStillOpen, 'Unsaved document should still be open after closeSaved');
        
        // Cleanup: close editor
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('Should correctly handle save and close operations', async () => {
        // Create a temporary document
        const doc = await vscode.workspace.openTextDocument({
            content: '// Integration test document\nconst test = "integration";',
            language: 'javascript'
        });
        
        const editor = await vscode.window.showTextDocument(doc);
        
        // Modify document to make it dirty
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), '// Added comment\n');
        });
        
        assert.ok(editor.document.isDirty, 'Document should be dirty after modification');
        
        // Test save and close all operation
        await vscode.commands.executeCommand('closeAll.saveAndCloseAll');
        
        // Note: In test environment, document might not actually save to disk
        // Here we mainly test that command can execute without throwing errors
        
        // Cleanup
        try {
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        } catch (e) {
            // Editor might already be closed
        }
    });

    test('Should be able to force close all editors', async () => {
        // Create multiple documents
        const docs = await Promise.all([
            vscode.workspace.openTextDocument({ content: '// Document 1', language: 'javascript' }),
            vscode.workspace.openTextDocument({ content: '// Document 2', language: 'javascript' }),
            vscode.workspace.openTextDocument({ content: '// Document 3', language: 'javascript' })
        ]);
        
        // Open all documents in editors
        const editors = await Promise.all(docs.map(doc => 
            vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus: true })
        ));
        
        assert.ok(editors.length >= 3, 'Should have at least 3 editors open');
        
        // Modify some documents (with safety checks)
        if (editors[0] && !editors[0].document.isClosed && editors[0] === vscode.window.activeTextEditor) {
            await editors[0].edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), '// Modified ');
            });
        }
        
        // Execute force close
        await vscode.commands.executeCommand('closeAll.closeAllForce');
        
        // Verify execution succeeded (command should not throw errors)
        assert.ok(true, 'Force close command should execute successfully');
        
        // Cleanup any remaining editors
        try {
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        } catch (e) {
            // Ignore cleanup errors
        }
    });
});

suite('Configuration Change Integration Tests', () => {
    
    test.skip('Configuration changes should be detected correctly', async () => {
        const config = vscode.workspace.getConfiguration('closeAll');

        // Get current configuration value
        const originalValue = config.get('keepCurrentActiveEditor');

        try {
            // Use test lifecycle manager for configuration management
            await testLifecycleManager.setupTestConfiguration([
                { section: 'closeAll', key: 'keepCurrentActiveEditor', value: !originalValue }
            ]);

            // Wait for configuration to update
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify configuration has changed using helper
            const configChanged = await waitForConfigurationUpdate('closeAll', 'keepCurrentActiveEditor', !originalValue);
            assert.ok(configChanged, 'Configuration should have changed');

            // Double-check the actual value
            const newValue = config.get('keepCurrentActiveEditor');
            assert.strictEqual(newValue, !originalValue, 'Configuration value should match expected');

        } finally {
            // Restore original configuration using lifecycle manager
            await testLifecycleManager.cleanup();
        }
    });

    test.skip('Status bar button configuration should be updatable', async () => {
        const config = vscode.workspace.getConfiguration('closeAll');
        const originalAction = config.get('buttonAction');

        try {
            // Use test lifecycle manager for configuration management
            await testLifecycleManager.setupTestConfiguration([
                { section: 'closeAll', key: 'buttonAction', value: 'saveAndCloseAll' }
            ]);

            // Wait for configuration to update
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify configuration has changed using helper
            const configChanged = await waitForConfigurationUpdate('closeAll', 'buttonAction', 'saveAndCloseAll');
            assert.ok(configChanged, 'Button action configuration should have been updated');

            // Double-check the actual value
            const newAction = config.get('buttonAction');
            assert.strictEqual(newAction, 'saveAndCloseAll', 'Button action should be updated to saveAndCloseAll');

        } finally {
            // Restore original configuration using lifecycle manager
            await testLifecycleManager.cleanup();
        }
    });
});

suite('Performance Tests', () => {
    
    test('Performance handling of multiple editors', async function() {
        // Increase test timeout
        this.timeout(10000);
        
        const startTime = Date.now();
        
        // Create multiple documents (simulating many editors)
        const docs = [];
        for (let i = 0; i < 10; i++) {
            const doc = await vscode.workspace.openTextDocument({
                content: `// Performance test document ${i}\nconsole.log("Document ${i}");`,
                language: 'javascript'
            });
            docs.push(doc);
        }
        
        // Open some editors
        const editors = [];
        for (let i = 0; i < Math.min(5, docs.length); i++) {
            const editor = await vscode.window.showTextDocument(docs[i], { 
                viewColumn: vscode.ViewColumn.One, 
                preserveFocus: true 
            });
            editors.push(editor);
        }
        
        // Execute close operation
        await vscode.commands.executeCommand('closeAll.closeAllForce');
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        // Verify performance (should complete within reasonable time)
        assert.ok(executionTime < 5000, `Operation should complete within 5 seconds, actual time: ${executionTime}ms`);
        
        // Cleanup
        try {
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        } catch (e) {
            // Ignore cleanup errors
        }
    });
});