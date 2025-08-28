# GitHub Actions Workflows

This repository includes automated CI/CD workflows for the Advanced Close All VS Code extension.

## Workflows

### 1. CI - Build and Test (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches  
- Pull requests to `main` branch

**What it does:**
- Tests on Node.js 18 and 20
- Runs linting and type checking
- Executes test suite
- Builds the extension
- Uploads build artifacts

### 2. Release (`release.yml`)

**Triggers:**
- Push tags matching `v*` pattern (e.g., `v1.0.0`, `v1.1.0`)

**What it does:**
- Builds and tests the extension
- Packages the extension as `.vsix` file
- Creates a GitHub Release with release notes
- Uploads the `.vsix` file as a release asset
- Optionally publishes to VS Code Marketplace (if `VSCE_TOKEN` secret is configured)

## Usage

### Creating a Release

1. **Update version in `package.json`:**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Create and push a tag:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. **The workflow will automatically:**
   - Build and test the extension
   - Create a GitHub release
   - Upload the `.vsix` file for download

### Setting Up Marketplace Auto-Publishing

To enable automatic publishing to VS Code Marketplace on releases:

1. **Get your Personal Access Token:**
   - Go to [Azure DevOps](https://dev.azure.com/_usersSettings/tokens)
   - Create a token with `Marketplace (Manage)` permissions

2. **Add the token to repository secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new secret named `VSCE_TOKEN`
   - Paste your Personal Access Token as the value

3. **Future tagged releases will automatically publish to the Marketplace**

## Download Built Extensions

### From Releases
- Go to the [Releases](https://github.com/addozhang/vscode-close-all-extension/releases) page
- Download the `.vsix` file from any release
- Install using `code --install-extension path/to/file.vsix`

### From CI Artifacts
- Go to any successful CI run
- Download the `extension-build` artifact
- Extract and install the `.vsix` file

## Status Badges

Add these to your main README to show build status:

```markdown
[![CI](https://github.com/addozhang/vscode-close-all-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/addozhang/vscode-close-all-extension/actions/workflows/ci.yml)
[![Release](https://github.com/addozhang/vscode-close-all-extension/actions/workflows/release.yml/badge.svg)](https://github.com/addozhang/vscode-close-all-extension/actions/workflows/release.yml)
```