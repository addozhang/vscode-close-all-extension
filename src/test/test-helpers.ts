import * as vscode from 'vscode';

/**
 * Test helper utilities - Handle asynchronous and timing issues in test environment
 */

/**
 * Wait for extension to fully activate
 * @param extensionId Extension ID
 * @param timeout Timeout in milliseconds
 */
export async function waitForExtensionActivation(extensionId: string, timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const extension = vscode.extensions.getExtension(extensionId);
        if (extension && extension.isActive) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

/**
 * Wait for configuration update to take effect
 * @param section Configuration section
 * @param key Configuration key
 * @param expectedValue Expected value
 * @param timeout Timeout in milliseconds
 */
export async function waitForConfigurationUpdate(
    section: string,
    key: string,
    expectedValue: any,
    timeout: number = 3000
): Promise<boolean> {
    const startTime = Date.now();
    const config = vscode.workspace.getConfiguration(section);

    while (Date.now() - startTime < timeout) {
        const currentValue = config.get(key);
        if (currentValue === expectedValue) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    return false;
}

/**
 * Retry function execution
 * @param fn Function to execute
 * @param maxRetries Maximum retry attempts
 * @param delay Retry delay in milliseconds
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 200
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(lastError?.message || 'Retry failed');
}

/**
 * Wait for command to be available
 * @param commandId Command ID
 * @param timeout Timeout in milliseconds
 */
export async function waitForCommand(commandId: string, timeout: number = 1500): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const commands = await vscode.commands.getCommands();
        if (commands.includes(commandId)) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

/**
 * Create test configuration manager
 */
export class TestConfigurationManager {
    private originalValues: Map<string, any> = new Map();

    /**
     * Set configuration value and record original value
     */
    async setConfiguration(section: string, key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(section);
        const originalValue = config.get(key);

        this.originalValues.set(`${section}.${key}`, originalValue);

        await config.update(key, value, vscode.ConfigurationTarget.Global);
        await waitForConfigurationUpdate(section, key, value);
    }

    /**
     * Restore all configurations to original values
     */
    async restoreAll(): Promise<void> {
        for (const [key, value] of this.originalValues) {
            const [section, configKey] = key.split('.');
            const config = vscode.workspace.getConfiguration(section);
            await config.update(configKey, value, vscode.ConfigurationTarget.Global);
        }
        this.originalValues.clear();
    }
}

/**
 * Test lifecycle manager
 */
export class TestLifecycleManager {
    private configManager = new TestConfigurationManager();

    /**
     * Set up test configuration
     */
    async setupTestConfiguration(configs: Array<{section: string, key: string, value: any}>): Promise<void> {
        for (const config of configs) {
            await this.configManager.setConfiguration(config.section, config.key, config.value);
        }
    }

    /**
     * Clean up test environment
     */
    async cleanup(): Promise<void> {
        await this.configManager.restoreAll();
        // Close all editors
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    }
}

// Export singleton instance
export const testLifecycleManager = new TestLifecycleManager();