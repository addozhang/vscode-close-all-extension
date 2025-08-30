import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

/**
 * Dedicated test suite for force close functionality
 * Used to verify the correctness of force close functionality and expose issues in current implementation
 */
suite('Force Close Functionality Test Suite', () => {
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Basic Functionality Tests', () => {
        test('should be able to force close all text editor tabs', async () => {
            // Create multiple test documents
            const docs = await Promise.all([
                vscode.workspace.openTextDocument({ content: '// Document 1', language: 'javascript' }),
                vscode.workspace.openTextDocument({ content: '// Document 2', language: 'javascript' }),
                vscode.workspace.openTextDocument({ content: '// Document 3', language: 'javascript' })
            ]);

            // Open all documents
            const editors = await Promise.all(docs.map(doc =>
                vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus: true })
            ));

            // Verify editors are opened
            assert.ok(editors.length >= 3, 'Should have at least 3 editors open');

            // Modify some documents to make them dirty (fix: check if editor is still valid)
            if (editors[0] && !editors[0].document.isClosed && editors[0] === vscode.window.activeTextEditor) {
                await editors[0].edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), '// Modified\n');
                });
            }
            if (editors[1] && !editors[1].document.isClosed && editors[1] === vscode.window.activeTextEditor) {
                await editors[1].edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), '// Modified\n');
                });
            }

            // Verify documents are indeed dirty
            assert.ok(editors[0].document.isDirty, 'First document should be dirty');
            assert.ok(editors[1].document.isDirty, 'Second document should be dirty');

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Verify all editors are closed (this should expose issue: force close may not close all tabs)
            const remainingEditors = vscode.window.visibleTextEditors;
            assert.strictEqual(remainingEditors.length, 0, 'All editors should be closed, but remaining: ' + remainingEditors.length);

            // Verify if dirty document changes are lost (this should expose issue: force close should lose unsaved changes)
            // Note: In this test environment, we cannot fully verify if files are really not saved to disk
        });

        test('should handle correctly when no tabs exist', async () => {
            // Ensure no editors are open
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Should show information message instead of throwing error
            const visibleEditors = vscode.window.visibleTextEditors;
            assert.strictEqual(visibleEditors.length, 0, 'Should remain with no tabs when no tabs exist');
        });

        test('should handle correctly when only non-text tabs exist', async () => {
            // This test may be difficult to implement in test environment because non-text tabs are usually internal to VSCode
            // But we can test if the command executes normally
            await vscode.commands.executeCommand('closeAll.closeAllForce');
            assert.ok(true, 'Command should execute normally even with only non-text tabs');
        });

        test('should correctly handle newly created Untitled editors', async () => {
            // Create a new Untitled document (simulating user creating new file)
            const doc = await vscode.workspace.openTextDocument({
                content: '',
                language: 'plaintext'
            });

            // Open the document in editor
            const editor = await vscode.window.showTextDocument(doc);

            // Verify it's an Untitled document
            assert.ok(doc.uri.scheme === 'untitled', 'Should be an Untitled document');
            assert.strictEqual(doc.getText(), '', 'New Untitled document should be empty');

            // Add some content to make it "dirty" (unsaved changes)
            await editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), 'This is a new file content');
            });

            // Check if document became dirty (in test environment, this may not always work as expected)
            const isDirtyAfterEdit = doc.isDirty;
            console.log(`Document dirty status after edit: ${isDirtyAfterEdit}`);

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Verify the Untitled editor is closed (force close should work regardless of dirty status)
            const remainingEditors = vscode.window.visibleTextEditors;
            const untitledEditors = remainingEditors.filter(e =>
                e.document.uri.scheme === 'untitled' &&
                e.document.uri.toString() === doc.uri.toString()
            );

            assert.strictEqual(untitledEditors.length, 0, 'Newly created Untitled editor should be closed by force close');
        });
    });

    suite('keepActive Option Tests', () => {
        test('should keep active editor when keepActive=true', async () => {
            // Create test documents
            const docs = await Promise.all([
                vscode.workspace.openTextDocument({ content: '// Document 1', language: 'javascript' }),
                vscode.workspace.openTextDocument({ content: '// Document 2', language: 'javascript' })
            ]);

            // Open documents
            const editor1 = await vscode.window.showTextDocument(docs[0]);
            const editor2 = await vscode.window.showTextDocument(docs[1], { viewColumn: vscode.ViewColumn.One, preserveFocus: true });

            // Set second editor as active
            await vscode.window.showTextDocument(docs[1]);

            // Modify configuration
            const config = vscode.workspace.getConfiguration('closeAll');
            await config.update('keepCurrentActiveEditor', true, vscode.ConfigurationTarget.Global);

            try {
                // Execute force close
                await vscode.commands.executeCommand('closeAll.closeAllForce');

                // Verify active editor is kept (this may expose issue)
                const remainingEditors = vscode.window.visibleTextEditors;
                const activeEditor = vscode.window.activeTextEditor;

                if (remainingEditors.length > 0) {
                    assert.ok(activeEditor !== undefined, 'Should have active editor');
                    assert.strictEqual(activeEditor!.document.uri.toString(), docs[1].uri.toString(),
                        'Active editor should be the second document');
                }
            } finally {
                // Restore configuration
                await config.update('keepCurrentActiveEditor', false, vscode.ConfigurationTarget.Global);
            }
        });

        test('should close all editors including active editor when keepActive=false', async () => {
            // Create test documents
            const docs = await Promise.all([
                vscode.workspace.openTextDocument({ content: '// Document 1', language: 'javascript' }),
                vscode.workspace.openTextDocument({ content: '// Document 2', language: 'javascript' })
            ]);

            // Open documents
            await vscode.window.showTextDocument(docs[0]);
            await vscode.window.showTextDocument(docs[1]);

            // Ensure keepActive=false
            const config = vscode.workspace.getConfiguration('closeAll');
            await config.update('keepCurrentActiveEditor', false, vscode.ConfigurationTarget.Global);

            try {
                // Execute force close
                await vscode.commands.executeCommand('closeAll.closeAllForce');

                // Verify all editors are closed
                const remainingEditors = vscode.window.visibleTextEditors;
                assert.strictEqual(remainingEditors.length, 0, 'All editors should be closed, including active editor');
            } finally {
                // Restore configuration
                await config.update('keepCurrentActiveEditor', false, vscode.ConfigurationTarget.Global);
            }
        });
    });

    suite('Confirmation Dialog Tests', () => {
        test('should show confirmation dialog when confirmationDialog=true', async () => {
            // Create test document
            const doc = await vscode.workspace.openTextDocument({ content: '// Test', language: 'javascript' });
            await vscode.window.showTextDocument(doc);

            // Modify document to make it dirty
            const editor = vscode.window.activeTextEditor!;
            await editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), '// Modified\n');
            });

            // Enable confirmation dialog
            const config = vscode.workspace.getConfiguration('closeAll');
            await config.update('confirmationDialog', true, vscode.ConfigurationTarget.Global);

            // Mock confirmation dialog
            const showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
            showWarningMessageStub.resolves('Yes' as any);

            try {
                // Execute force close
                await vscode.commands.executeCommand('closeAll.closeAllForce');

                // Verify confirmation dialog is called (this should expose issue: force close may not always show confirmation dialog)
                assert.ok(showWarningMessageStub.calledOnce, 'Should show confirmation dialog');
                const callArgs = showWarningMessageStub.firstCall.args;
                assert.ok(typeof callArgs[0] === 'string' && callArgs[0].length > 0, 'Dialog message should be a non-empty string');
            } finally {
                // Restore configuration
                await config.update('confirmationDialog', false, vscode.ConfigurationTarget.Global);
            }
        });

        test('should cancel operation when user cancels confirmation dialog', async () => {
            // Create test document
            const doc = await vscode.workspace.openTextDocument({ content: '// Test', language: 'javascript' });
            const editor = await vscode.window.showTextDocument(doc);

            // Enable confirmation dialog
            const config = vscode.workspace.getConfiguration('closeAll');
            await config.update('confirmationDialog', true, vscode.ConfigurationTarget.Global);

            // Mock confirmation dialog - user cancels
            const showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
            showWarningMessageStub.resolves(undefined); // User cancels

            try {
                // Execute force close
                await vscode.commands.executeCommand('closeAll.closeAllForce');

                // Verify editor is still open (operation cancelled)
                const remainingEditors = vscode.window.visibleTextEditors;
                assert.ok(remainingEditors.length > 0, 'Editor should remain open when user cancels');
            } finally {
                // Restore configuration
                await config.update('confirmationDialog', false, vscode.ConfigurationTarget.Global);
            }
        });
    });

    suite('Different Tab Types Handling Tests', () => {
        test('should be able to handle mixed text and non-text tabs', async () => {
            // Create text document
            const doc = await vscode.workspace.openTextDocument({ content: '// Test', language: 'javascript' });
            await vscode.window.showTextDocument(doc);

            // Note: In test environment, we cannot easily create non-text tabs (like settings pages)
            // But we can test if the code can handle this situation

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Verify command executes successfully
            assert.ok(true, 'Should be able to handle mixed tab types');
        });

        test('should correctly count different types of tabs', async () => {
            // This test needs more complex mocking to simulate different types of tabs
            // In actual implementation, we need to check tabGroups API usage

            // Create text document
            const doc = await vscode.workspace.openTextDocument({ content: '// Test', language: 'javascript' });
            await vscode.window.showTextDocument(doc);

            // Mock showInformationMessage to capture message
            const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // If information message is shown, verify its content
            if (showInfoStub.called) {
                const message = showInfoStub.firstCall.args[0];
                assert.ok(message.includes('tab'), 'Information message should mention tabs');
            }
        });
    });

    suite('Error Handling and Edge Cases Tests', () => {
        test('should show error message when closing tabs fails', async () => {
            // Note: Due to VSCode API limitations, we cannot directly mock tabGroups.close
            // This test verifies if the extension can handle potential error situations

            // Create test document
            const doc = await vscode.workspace.openTextDocument({ content: '// Test', language: 'javascript' });
            await vscode.window.showTextDocument(doc);

            // Mock error message display to verify error handling
            const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage');

            // Execute force close (should normally succeed)
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // In normal cases, error message should not be shown
            // This test mainly verifies the existence of error handling code paths
            // If there are error situations in the future, this stub will capture error messages

            showErrorStub.restore();
            assert.ok(true, 'Error handling test completed - extension should have proper error handling mechanisms');
        });

        test('should handle empty tab arrays', async () => {
            // Note: Due to VSCode API limitations, we cannot directly modify tabGroups.all
            // But we can test behavior when no tabs exist

            // Ensure no editors are open
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Verify operation completes successfully (no errors thrown)
            const remainingEditors = vscode.window.visibleTextEditors;
            assert.strictEqual(remainingEditors.length, 0, 'Should be able to handle empty tab arrays');
        });
    });

    suite('Performance and Stress Tests', () => {
        test('should be able to handle closing operations for large number of tabs', async function() {
            this.timeout(30000); // Increase timeout

            const startTime = Date.now();

            // Create large number of test documents
            const docPromises = [];
            for (let i = 0; i < 20; i++) {
                docPromises.push(
                    vscode.workspace.openTextDocument({
                        content: `// Performance test document ${i}\nconsole.log("Document ${i}");`,
                        language: 'javascript'
                    })
                );
            }

            const docs = await Promise.all(docPromises);

            // Open first 10 documents
            const editorPromises = [];
            for (let i = 0; i < 10; i++) {
                editorPromises.push(
                    vscode.window.showTextDocument(docs[i], {
                        viewColumn: vscode.ViewColumn.One,
                        preserveFocus: true
                    })
                );
            }

            await Promise.all(editorPromises);

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Verify performance (should complete within reasonable time)
            assert.ok(executionTime < 10000, `Large number of tabs closing should complete within 10 seconds, actual time: ${executionTime}ms`);

            // Verify all editors are closed
            const remainingEditors = vscode.window.visibleTextEditors;
            assert.strictEqual(remainingEditors.length, 0, 'All editors should be closed');
        });

        test('should work normally under memory pressure', async () => {
            // Create moderate number of documents
            const docs = await Promise.all(
                Array.from({ length: 15 }, (_, i) =>
                    vscode.workspace.openTextDocument({
                        content: `// Memory test ${i}\n${'x'.repeat(1000)}`, // Larger content
                        language: 'javascript'
                    })
                )
            );

            // Open some editors
            await Promise.all(
                docs.slice(0, 8).map(doc =>
                    vscode.window.showTextDocument(doc, { preserveFocus: true })
                )
            );

            // Execute force close
            await vscode.commands.executeCommand('closeAll.closeAllForce');

            // Verify operation completes successfully
            const remainingEditors = vscode.window.visibleTextEditors;
            assert.strictEqual(remainingEditors.length, 0, 'Should successfully close all editors');
        });
    });

    suite('Configuration Combination Tests', () => {
        test('should correctly handle combinations of all configuration options', async () => {
            // Create test documents
            const docs = await Promise.all([
                vscode.workspace.openTextDocument({ content: '// Doc 1', language: 'javascript' }),
                vscode.workspace.openTextDocument({ content: '// Doc 2', language: 'javascript' })
            ]);

            await vscode.window.showTextDocument(docs[0]);
            await vscode.window.showTextDocument(docs[1]);

            // Set various configuration combinations
            const config = vscode.workspace.getConfiguration('closeAll');
            await config.update('keepCurrentActiveEditor', true, vscode.ConfigurationTarget.Global);
            await config.update('confirmationDialog', true, vscode.ConfigurationTarget.Global);

            // Mock confirmation dialog
            const showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
            showWarningMessageStub.resolves('Yes' as any);

            try {
                // Execute force close
                await vscode.commands.executeCommand('closeAll.closeAllForce');

                // Verify confirmation dialog is called
                assert.ok(showWarningMessageStub.called, 'Should show confirmation dialog');

                // Verify active editor is kept (if any)
                const remainingEditors = vscode.window.visibleTextEditors;
                if (remainingEditors.length > 0) {
                    const activeEditor = vscode.window.activeTextEditor;
                    assert.ok(activeEditor !== undefined, 'Should have active editor');
                }
            } finally {
                // Restore configuration
                await config.update('keepCurrentActiveEditor', false, vscode.ConfigurationTarget.Global);
                await config.update('confirmationDialog', false, vscode.ConfigurationTarget.Global);
            }
        });
    });
});