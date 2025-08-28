# Advanced Close All - VS Code Extension

An advanced VS Code extension that provides intelligent functionality to close all tabs with multiple closing modes and comprehensive configuration options. Supports closing all types of VS Code tabs including editors, extension details, settings pages, and more.

![Advanced Close All Icon](./images/icon.png)

## Features

### 🚀 Advanced Tab Closing Modes
- **Close All Saved Editors and Other Tabs**: Closes all saved editors plus all non-editor tabs (extension details, settings, etc.)
- **Save and Close All Tabs**: Automatically saves all unsaved files before closing all tabs (editors and non-editors)
- **Force Close All Tabs**: Closes all tabs without saving (discards unsaved changes)

### 🎯 Smart Tab Detection
- **All Tab Types Support**: Works with editors, extension details, settings pages, output panels, and all other VS Code tab types
- **Intelligent Filtering**: Different behavior for text editors vs. other tab types based on the selected mode
- **Advanced Tab Discovery**: Uses VS Code's tabGroups API for comprehensive tab detection

### 🏷️ Understanding Tab Types

Advanced Close All recognizes two main categories of tabs:

#### Text Editor Tabs
- Source code files (`.js`, `.ts`, `.py`, etc.)
- Markdown files (`.md`)
- Configuration files (`.json`, `.xml`, etc.)
- Any file that can be edited as text

**Behavior**: These tabs can be dirty (unsaved) or clean (saved), affecting how different modes handle them.

#### Other Tab Types
- Extension details pages
- VS Code settings pages
- Output panels
- Terminal panels
- Welcome pages
- Search results
- Git diff views
- Any non-text editor content

**Behavior**: These tabs are always closed regardless of mode (except in "saved" mode where they're closed along with saved editors).

### ⚙️ Smart Configuration Options
- **Keep Current Active Editor**: Option to preserve the currently active editor when closing others
- **Confirmation Dialog**: Optional confirmation prompt before closing tabs with detailed statistics
- **Custom Keybindings**: Set your own keyboard shortcuts for each closing mode (supports macOS and Windows/Linux)
- **Configurable Status Bar Button**: Customize which action the status bar button performs
- **Dynamic Button Updates**: Status bar button text and behavior update automatically based on configuration

### 🎯 User Interface
- **Command Palette Integration**: Access all functions via `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
- **Editor Title Bar Button**: Smart button that changes based on your configuration
- **Context Menu Integration**: Right-click in editor tabs for quick access to all closing options
- **Status Bar Button**: Quick access button with dynamic text showing current mode
- **Real-time Updates**: All UI elements update immediately when configuration changes

## Installation

### From VS Code Marketplace (Coming Soon)
1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open the Extensions view
3. Search for "Advanced Close All"
4. Click Install

### Manual Installation
1. Download the latest `.vsix` file from the releases
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
4. Type "Extensions: Install from VSIX..."
5. Select the downloaded `.vsix` file

## Usage

### 🎯 Closing Modes in Detail

#### 1. Close Saved Editors and Other Tabs (`closeSaved`)
**What it does**:
- Closes all saved (non-dirty) text editor tabs
- Closes ALL other tab types (settings, extensions, etc.)
- Keeps unsaved text editor tabs open

**Use case**: Clean up your workspace while preserving work in progress.

**Example**:
- Before: 3 saved files + 2 unsaved files + 1 settings page + 1 extension page
- After: 2 unsaved files remain open
- Result: "Closed 5 tab(s): 3 editor(s) + 2 other tab(s)"

#### 2. Save and Close All Tabs (`saveAndCloseAll`)
**What it does**:
- Saves all unsaved text editor tabs first
- Closes ALL tabs (editors and others)

**Use case**: End your work session or start fresh with everything saved.

**Example**:
- Before: 3 saved files + 2 unsaved files + 1 settings page
- Process: Saves the 2 unsaved files automatically
- After: All tabs closed
- Result: "Closed 6 tab(s): 5 editor(s) + 1 other tab(s)"

#### 3. Force Close All Tabs (`closeAllForce`)
**What it does**:
- Closes ALL tabs immediately
- Does NOT save unsaved changes (they will be lost!)

**Use case**: Quick reset when you want to discard all changes and start over.

**Warning**: ⚠️ This will lose any unsaved work!

**Example**:
- Before: 3 saved files + 2 unsaved files + 1 settings page
- After: All tabs closed, unsaved changes discarded
- Result: "Closed 6 tab(s): 5 editor(s) + 1 other tab(s)"

### Command Palette
Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) and type:
- `Close All: Close Saved Editors and Other Tabs`
- `Close All: Save and Close All Tabs`
- `Close All: Close All Tabs Forcefully`

## Configuration

### Accessing Settings
1. **Via Settings UI**:
   - `File > Preferences > Settings`
   - Search for `@ext:addozhang.close-all`

2. **Via Command Palette**:
   - `Ctrl+Shift+P` → "Preferences: Open Settings"
   - Search for "Advanced Close All"

### Available Settings

#### `closeAll.keepCurrentActiveEditor`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Keeps the currently active editor open when closing others

#### `closeAll.confirmationDialog`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Shows a confirmation dialog with detailed statistics before closing

**Confirmation Dialog Shows**:
- Total number of tabs to be closed
- "Yes" button to confirm or cancel to abort

#### `closeAll.buttonAction`
- **Type**: String
- **Default**: `"closeSaved"`
- **Options**: `"closeSaved"`, `"saveAndCloseAll"`, `"closeAllForce"`
- **Description**: Determines what action the toolbar and status bar buttons perform

### Complete Configuration Example
```json
{
  "closeAll.keepCurrentActiveEditor": true,
  "closeAll.confirmationDialog": true,
  "closeAll.buttonAction": "saveAndCloseAll"
}
```

### Default Keybindings

#### Windows/Linux:
- `Ctrl+Alt+W`: Close all saved editors and other tabs
- `Ctrl+Alt+S`: Save and close all tabs
- `Ctrl+Alt+F`: Force close all tabs

#### macOS:
- `Cmd+Alt+W`: Close all saved editors and other tabs
- `Cmd+Alt+S`: Save and close all tabs
- `Cmd+Alt+F`: Force close all tabs

### Editor Title Bar Button
Click the button in the editor title bar (top-right area). The button's icon and action change based on your configuration:
- **Circle Slash (○⃠)**: Close saved editors + other tabs
- **Save All (💾)**: Save and close all tabs
- **Close All (✕)**: Force close all tabs

### Status Bar Button
Click the status bar button in the bottom-right corner. The button text shows the current mode:
- "Close Saved + Others": Close saved editors and other tabs
- "Save & Close All": Save and close all tabs
- "Force Close All": Force close all tabs

## Extension Settings

This extension contributes the following settings (accessible via `File > Preferences > Settings` or search `@ext:addozhang.close-all`):

- `closeAll.keepCurrentActiveEditor`: Whether to keep the current active editor when closing all tabs (default: `false`)
- `closeAll.confirmationDialog`: Whether to show a confirmation dialog before closing all tabs with detailed statistics (default: `false`)
- `closeAll.manageKeybindings`: Customize keyboard shortcuts for Advanced Close All commands (click to open keybinding settings)
- `closeAll.buttonAction`: Action for the close all button (options: `closeSaved`, `saveAndCloseAll`, `closeAllForce`)

### Button Action Options:
- **`closeSaved`**: Close only saved editors and all other tabs (extension details, settings, etc.)
- **`saveAndCloseAll`**: Save all unsaved files and close all tabs
- **`closeAllForce`**: Force close all tabs without saving

### Keybinding Management:
To customize keyboard shortcuts:
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Search for "Preferences: Open Keyboard Shortcuts"
3. Filter by `closeAll` to find Advanced Close All commands
4. Click on any command to set custom keybindings

This approach uses VS Code's built-in keybinding management system for the best user experience.

### Example Settings Configuration

```json
{
  "closeAll.keepCurrentActiveEditor": true,
  "closeAll.confirmationDialog": true,
  "closeAll.buttonAction": "saveAndCloseAll"
}
```

## Custom Keybindings

To set custom keybindings, add them to your `keybindings.json` file:

### Windows/Linux Example:
```json
[
  {
    "command": "closeAll.closeSaved",
    "key": "ctrl+shift+w"
  },
  {
    "command": "closeAll.saveAndCloseAll",
    "key": "ctrl+shift+s"
  },
  {
    "command": "closeAll.closeAllForce",
    "key": "ctrl+shift+f"
  }
]
```

### macOS Example:
```json
[
  {
    "command": "closeAll.closeSaved",
    "key": "cmd+shift+w"
  },
  {
    "command": "closeAll.saveAndCloseAll",
    "key": "cmd+shift+s"
  },
  {
    "command": "closeAll.closeAllForce",
    "key": "cmd+shift+f"
  }
]
```

### How to Access keybindings.json:
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Preferences: Open Keyboard Shortcuts (JSON)"
3. Add your custom keybindings to the array

## Requirements

- VS Code version 1.98.0 or higher
- Supports Windows, macOS, and Linux

## 🎯 Advanced Usage & Workflow Integration

### Development Workflow
```
1. Start work: Open project files
2. During development: Use "Close Saved + Others" to clean up while keeping work
3. Break time: Use "Save & Close All" to save everything and start fresh
4. End of day: Use "Save & Close All" to clean up completely
```

### Power User Tips

#### 1. **Rapid Context Switching**
Set `keepCurrentActiveEditor: true` and use "Close Saved + Others" to quickly switch project contexts while keeping your main file open.

#### 2. **Safe Experimentation**
Before making experimental changes:
1. Use "Save & Close All" to save current state
2. Make experimental changes
3. Use "Force Close All" if experiment fails
4. Reopen files to return to saved state

#### 3. **Meeting Prep**
Use "Save & Close All" before screen sharing to ensure a clean, professional workspace.

#### 4. **Performance Optimization**
Regularly use "Close Saved + Others" to reduce memory usage by closing non-essential tabs while keeping your work intact.

### 🆕 Enhanced Tab Support
- **All Tab Types**: Now closes editors, extension details, settings pages, output panels, and more
- **Smart Detection**: Uses VS Code's advanced tabGroups API for comprehensive tab discovery
- **Intelligent Filtering**: Different behavior for text editors vs. other tab types

### 📊 Improved User Feedback
- **Detailed Statistics**: Shows exact count of editors vs. other tabs closed
- **Enhanced Confirmation**: Confirmation dialog shows breakdown of tab types
- **Dynamic UI**: All buttons and text update based on current configuration

### ⚙️ Advanced Configuration
- **Cross-Platform Keybindings**: Automatic macOS/Windows key mapping
- **Flexible Button Behavior**: Status bar and title bar buttons adapt to settings
- **Real-time Updates**: Configuration changes apply immediately

## Known Issues

- To set custom keybindings, use VS Code's built-in Keyboard Shortcuts settings (`Ctrl+Shift+P` > "Preferences: Open Keyboard Shortcuts") or click the keybinding management link in extension settings.
- Some test cases need optimization for better reliability (currently 73.9% success rate)
- Configuration changes may require a brief moment to reflect in all UI elements

## Troubleshooting

### Common Issues

#### Extension Not Appearing
**Symptoms**: No buttons or commands visible
**Solutions**:
1. Check VS Code version (minimum 1.98.0)
2. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Check if extension is enabled in Extensions view

#### Keybindings Not Working
**Symptoms**: Keyboard shortcuts don't trigger actions
**Solutions**:
1. Check for conflicts: `File > Preferences > Keyboard Shortcuts`
2. Verify commands exist: `Ctrl+Shift+P` → Search for "Close All:"
3. Check `when` conditions in custom keybindings

#### Unexpected Closing Behavior
**Symptoms**: Wrong tabs being closed or kept open
**Solutions**:
1. Verify current `buttonAction` setting
2. Check `keepCurrentActiveEditor` setting
3. Understand tab type differences (editors vs. others)

#### Configuration Not Applying
**Symptoms**: Changes in settings don't take effect
**Solutions**:
1. Wait a moment for real-time updates
2. Try triggering a command to refresh
3. Reload window if necessary

### Debug Mode

#### Enable Detailed Logging
1. Open VS Code Developer Tools: `Help > Toggle Developer Tools`
2. Look for console messages starting with "closeEditors called"
3. Check for error messages or unexpected behavior

#### Test Configuration
1. Open several different tab types
2. Try each closing mode individually
3. Verify expected behavior matches actual results

### Getting Help

#### Before Reporting Issues
1. Check this guide for solutions
2. Verify VS Code and extension versions
3. Test with default settings
4. Try in a clean VS Code window

#### Reporting Bugs
Include:
- VS Code version
- Operating system
- Extension version
- Current configuration settings
- Steps to reproduce
- Expected vs. actual behavior

## Release Notes

### 0.0.1 - Advanced Close All

#### 🆕 New Features
- **All Tab Types Support**: Close editors, extension details, settings, and all VS Code tab types
- **Smart Tab Detection**: Advanced tabGroups API integration for comprehensive tab discovery
- **Cross-Platform Keybindings**: Native support for macOS (`Cmd`) and Windows/Linux (`Ctrl`) key combinations
- **Enhanced User Feedback**: Detailed statistics showing tab type breakdown (e.g., "3 editors + 2 other tabs")
- **Intelligent Mode Processing**: Different behavior for text editors vs. other tab types

#### ⚙️ Core Features
- Three intelligent closing modes with advanced tab support
- Configurable status bar button with dynamic text updates
- Editor title bar integration with context-sensitive button
- Comprehensive settings for customization
- Command palette integration with descriptive command names
- Real-time configuration updates

#### 🎯 Quality Assurance
- Comprehensive test suite with 23 test cases
- 73.9% test success rate with ongoing improvements
- Cross-platform compatibility (Windows, macOS, Linux)
- Performance tested with multiple tab scenarios

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Open in VS Code and press `F5` to run in Extension Development Host
4. Run tests: `npm test`

## License

This extension is licensed under the MIT License. Copyright (c) 2025 Addo Zhang.

---

**Enjoy efficient tab management with Advanced Close All! 🚀**

*For support, bug reports, or feature requests, please visit our [GitHub repository](https://github.com/addozhang/vscode-close-all-extension).*
