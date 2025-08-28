# VS Code Extension: Advanced Close All Development Plan

## 📋 Requirements Overview
Develop a VS Code extension that provides intelligent functionality to close all editors, supporting multiple closing modes and comprehensive configuration.

## 🎯 Core Feature Requirements

### 1. Closing Functions
- ✅ **Close all saved editors**: Only closes saved files
- ✅ **Save and close all editors**: Save all unsaved files first, then close
- ✅ **Force close all editors**: Close without saving any files

### 2. User Interface
- ✅ **Command palette integration**: Access via `Ctrl+Shift+P`
- ✅ **Status bar button**: Display close button in bottom-right corner
- ✅ **Configurable button action**: Button behavior is configurable

### 3. Configuration System
- ✅ **Keep current active editor**: Option to preserve current file
- ✅ **Close confirmation prompt**: Option to show confirmation dialog
- ✅ **Custom keybindings**: Support setting shortcuts for each function
- ✅ **Button action configuration**: Configurable default button behavior

## 🏗️ Technical Architecture

### Project Structure
```
close-all/
├── src/
│   └── extension.ts          # Main logic implementation
├── package.json              # Extension configuration
├── tsconfig.json             # TypeScript configuration
├── esbuild.js               # Build configuration
├── plan.md                  # Development plan document
└── README.md                # Usage instructions
```

### Core Modules

#### 1. Configuration Management (`extension.ts`)
```typescript
// Configuration reading
function getConfig<T>(key: string, defaultValue: T): T {
    return vscode.workspace.getConfiguration('closeAll').get<T>(key, defaultValue);
}
```

#### 2. Closing Logic Implementation
```typescript
// Three closing modes
- 'saved': Only close saved editors
- 'saveAll': Save all then close
- 'force': Force close without saving
```

#### 3. User Interaction
- Confirmation dialog
- Status bar button
- Command palette integration

## ⚙️ Configuration Details

### package.json Configuration
```json
{
  "contributes": {
    "configuration": {
      "type": "object",
      "title": "Advanced Close All Configuration",
      "properties": {
        "closeAll.keepCurrentActiveEditor": {
          "type": "boolean",
          "default": false,
          "description": "Whether to keep the current active editor when closing all editors"
        },
        "closeAll.showConfirmationDialog": {
          "type": "boolean",
          "default": false,
          "description": "Whether to show a confirmation dialog before closing all editors"
        },
        "closeAll.closeSavedEditorsKeybinding": {
          "type": "string",
          "description": "Keybinding for closing all saved editors"
        },
        "closeAll.saveAndCloseAllEditorsKeybinding": {
          "type": "string",
          "description": "Keybinding for saving and closing all editors"
        },
        "closeAll.forceCloseAllEditorsKeybinding": {
          "type": "string",
          "description": "Keybinding for forcefully closing all editors"
        },
        "closeAll.buttonAction": {
          "type": "string",
          "enum": ["closeSaved", "saveAndCloseAll", "closeAllForce"],
          "description": "Action for the close all button"
        }
      }
    },
    "commands": [
      {
        "command": "closeAll.closeSaved",
        "title": "Close All: Close Saved Editors and Other Tabs"
      },
      {
        "command": "closeAll.saveAndCloseAll",
        "title": "Close All: Save and Close All Tabs"
      },
      {
        "command": "closeAll.closeAllForce",
        "title": "Close All: Close All Tabs Forcefully"
      }
    ]
  }
}
```

## 🔧 Implementation Details

### 1. Closing Logic (`closeEditors` Function)
- Get all currently visible editors
- Filter editors based on mode
- Handle logic for keeping active editor
- Show confirmation dialog (if enabled)
- Execute save operation (if needed)
- Batch close editors

### 2. Status Bar Button
- Dynamically read configuration to determine button behavior
- Display in bottom-right status bar
- Click to execute configured close action

### 3. Command Registration
- Three independent commands corresponding to three closing modes
- Each command supports full configuration options
- Asynchronous execution ensures smooth user experience

## 🚀 Usage

### 1. Installation and Running
```bash
cd close-all
npm install
# Press F5 to start debugging
```
