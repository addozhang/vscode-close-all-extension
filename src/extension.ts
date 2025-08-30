// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Helper function to get configuration
function getConfig<T>(key: string, defaultValue: T): T {
    return vscode.workspace.getConfiguration('closeAll').get<T>(key, defaultValue);
}

// Helper function to show confirmation dialog
async function showConfirmationDialog(message: string): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        'Yes'
    );
    return result === 'Yes';
}

// Helper function to close editors
async function closeEditors(
    mode: 'saved' | 'saveAll' | 'force',
    keepActive: boolean = false,
    showConfirmation: boolean = false
): Promise<void> {
    console.log(`closeEditors called with mode: ${mode}, keepActive: ${keepActive}, showConfirmation: ${showConfirmation}`);
    
    const activeEditor = vscode.window.activeTextEditor;
    const tabGroups = vscode.window.tabGroups;
    
    console.log(`Active editor: ${activeEditor ? activeEditor.document.fileName : 'None'}`);
    console.log(`Tab groups count: ${tabGroups.all.length}`);
    
    // Get all tabs from all tab groups (including non-text tabs)
    const allTabs: vscode.Tab[] = [];
    const textTabs: vscode.Tab[] = [];
    
    tabGroups.all.forEach((tabGroup, groupIndex) => {
        console.log(`Tab group ${groupIndex} has ${tabGroup.tabs.length} tabs`);
        tabGroup.tabs.forEach((tab, tabIndex) => {
            allTabs.push(tab);
            
            if (tab.input instanceof vscode.TabInputText) {
                console.log(`  Tab ${tabIndex}: ${tab.input.uri.fsPath}, isDirty: ${tab.isDirty}`);
                textTabs.push(tab);
            } else {
                console.log(`  Tab ${tabIndex}: Non-text input, type: ${tab.input?.constructor.name}`);
            }
        });
    });

    console.log(`Total tabs found: ${allTabs.length}, Text tabs: ${textTabs.length}`);
    
    if (allTabs.length === 0) {
        vscode.window.showInformationMessage('No tabs to close.');
        return;
    }

    let tabsToClose: vscode.Tab[] = [];

    // Filter based on mode
    if (mode === 'saved') {
        // For 'saved' mode, only close saved text editors and all non-text tabs
        const savedTextTabs = textTabs.filter(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                const isNotDirty = !tab.isDirty;
                console.log(`  Checking tab ${tab.input.uri.fsPath}: isDirty=${tab.isDirty}, willClose=${isNotDirty}`);
                return isNotDirty;
            }
            return false;
        });
        
        // Add all non-text tabs (like extension details, settings, etc.)
        const nonTextTabs = allTabs.filter(tab => !(tab.input instanceof vscode.TabInputText));
        
        tabsToClose = [...savedTextTabs, ...nonTextTabs];
        console.log(`After filtering: ${savedTextTabs.length} saved text tabs + ${nonTextTabs.length} non-text tabs = ${tabsToClose.length} total`);
    } else if (mode === 'saveAll') {
        // For 'saveAll' mode, save all dirty text editors first, then close all tabs
        tabsToClose = [...allTabs];
        console.log(`Save and close all mode: ${tabsToClose.length} tabs`);
    } else {
        // For 'force' mode, close all tabs without saving
        tabsToClose = [...allTabs];
        console.log(`Force close mode: ${tabsToClose.length} tabs`);
    }

    // Remove active editor tab if keepActive is true
    if (keepActive && activeEditor) {
        const activeUri = activeEditor.document.uri;
        console.log(`Active editor URI: ${activeUri.toString()}`);
        const beforeCount = tabsToClose.length;
        tabsToClose = tabsToClose.filter(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                const isNotActive = tab.input.uri.toString() !== activeUri.toString();
                console.log(`  Comparing ${tab.input.uri.toString()} with active: ${isNotActive}`);
                return isNotActive;
            }
            return true; // Keep all non-text tabs when keepActive is true
        });
        console.log(`After removing active tab: ${beforeCount} -> ${tabsToClose.length}`);
    }

    console.log(`Final tabs to close: ${tabsToClose.length}`);
    
    if (tabsToClose.length === 0) {
        vscode.window.showInformationMessage('No tabs to close based on current settings.');
        return;
    }

    // Show confirmation dialog if enabled
    if (showConfirmation) {
        const message = `Are you sure you want to close ${tabsToClose.length} tab(s)?`;
        const confirmed = await showConfirmationDialog(message);
        if (!confirmed) {
            console.log('User cancelled the operation');
            return;
        }
    }

    // Handle unsaved changes for force mode BEFORE closing tabs
    if (mode === 'force') {
        console.log('Force close mode: discarding unsaved changes');

        // Get all open text documents
        const openDocuments = vscode.workspace.textDocuments;

        // Discard changes for all unsaved documents
        for (const document of openDocuments) {
            if (document.isDirty) {
                console.log(`Discarding changes for: ${document.fileName}`);
                try {
                    // Revert the document to discard unsaved changes
                    await vscode.commands.executeCommand('workbench.action.files.revert', document.uri);
                } catch (error) {
                    console.warn(`Failed to revert ${document.fileName}:`, error);
                }
            }
        }
    }

    // Save all documents if mode is 'saveAll'
    if (mode === 'saveAll') {
        console.log('Saving all documents before closing');
        await vscode.workspace.saveAll();
    }

    // Close tabs using the new tab API
    console.log(`Attempting to close ${tabsToClose.length} tabs`);
    try {
        await vscode.window.tabGroups.close(tabsToClose);
        const textTabCount = tabsToClose.filter(tab => tab.input instanceof vscode.TabInputText).length;
        const nonTextTabCount = tabsToClose.length - textTabCount;
        vscode.window.showInformationMessage(`Closed ${tabsToClose.length} tab(s): ${textTabCount} editor(s) + ${nonTextTabCount} other tab(s).`);
        console.log(`Successfully closed ${tabsToClose.length} tabs`);
    } catch (error) {
        console.error('Error closing tabs:', error);
        vscode.window.showErrorMessage(`Error closing tabs: ${error}`);
    }
}

// Global status bar button reference
let statusBarButton: vscode.StatusBarItem;

// Function to update status bar button based on configuration
function updateStatusBarButton() {
    if (statusBarButton) {
        const buttonAction = getConfig('buttonAction', 'closeSaved');
        statusBarButton.command = `closeAll.${buttonAction}`;
        
        // Update button text based on action
        const actionTexts: { [key: string]: string } = {
            'closeSaved': '$(circle-slash) Close Saved + Others',
            'saveAndCloseAll': '$(save-all) Save & Close All',
            'closeAllForce': '$(close-all) Force Close All'
        };
        statusBarButton.text = actionTexts[buttonAction] || '$(circle-slash) Close All';
        statusBarButton.tooltip = `Close all tabs - Current action: ${buttonAction}`;
    }
}

// Function to apply custom keybindings (simplified)
async function applyCustomKeybindings() {
    // Keybinding management is now handled through VS Code's built-in keybinding settings
    // Users can access it via Command Palette > "Preferences: Open Keyboard Shortcuts"
    console.log('Keybinding management is handled through VS Code keybinding settings');
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Advanced Close All" is now active!');

    // Register commands
    const closeSavedCommand = vscode.commands.registerCommand('closeAll.closeSaved', async () => {
        const keepActive = getConfig('keepCurrentActiveEditor', false);
        const showConfirmation = getConfig('confirmationDialog', false);
        await closeEditors('saved', keepActive, showConfirmation);
    });
    context.subscriptions.push(closeSavedCommand);

    const saveAndCloseAllCommand = vscode.commands.registerCommand('closeAll.saveAndCloseAll', async () => {
        const keepActive = getConfig('keepCurrentActiveEditor', false);
        const showConfirmation = getConfig('confirmationDialog', false);
        await closeEditors('saveAll', keepActive, showConfirmation);
    });
    context.subscriptions.push(saveAndCloseAllCommand);

    const closeAllForceCommand = vscode.commands.registerCommand('closeAll.closeAllForce', async () => {
        const keepActive = getConfig('keepCurrentActiveEditor', false);
        const showConfirmation = getConfig('confirmationDialog', false);
        await closeEditors('force', keepActive, showConfirmation);
    });
    context.subscriptions.push(closeAllForceCommand);

    // Create status bar button
    statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    updateStatusBarButton();
    statusBarButton.show();
    context.subscriptions.push(statusBarButton);

    // Listen for configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('closeAll.buttonAction')) {
            updateStatusBarButton();
        }
    });
    context.subscriptions.push(configChangeDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
