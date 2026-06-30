# Deployment Guide

This guide covers building and deploying VPS Studio for production use.

## Table of Contents

- [Build Process](#build-process)
- [Platform-Specific Builds](#platform-specific-builds)
- [Distribution](#distribution)
- [Updates](#updates)
- [Troubleshooting](#troubleshooting)

## Build Process

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://www.rust-lang.org/tools/install) v1.70+
- Platform-specific dependencies (see [Installation Guide](installation.md))

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run tauri build

# Output location
src-tauri/target/release/bundle/
```

### Build Output

The build process generates platform-specific packages:

| Platform | Output | Location |
|----------|--------|----------|
| **Windows** | `.exe` installer | `src-tauri/target/release/bundle/nsis/` |
| **macOS** | `.dmg` disk image | `src-tauri/target/release/bundle/dmg/` |
| **Linux** | `.deb` package | `src-tauri/target/release/bundle/deb/` |
| **Linux** | `.AppImage` | `src-tauri/target/release/bundle/appimage/` |

## Platform-Specific Builds

### Windows

#### Prerequisites

- Windows 10+ (64-bit)
- NSIS (included with Tauri)
- WebView2 (usually pre-installed on Windows 10+)

#### Build

```bash
npm run tauri build
```

#### Output

- `vps-studio_0.1.0_x64-setup.exe` - NSIS installer
- `vps-studio_0.1.0_x64.msi` - MSI installer (optional)

#### Code Signing

For production releases, code signing is recommended:

1. Obtain a code signing certificate
2. Configure in `tauri.conf.json`:

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

3. Set environment variables:

```bash
set TAURI_SIGNING_PRIVATE_KEY=your_key
set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=your_password
```

### macOS

#### Prerequisites

- macOS 11+
- Xcode Command Line Tools
- Apple Developer ID (for distribution)

#### Build

```bash
npm run tauri build
```

#### Output

- `VPS Studio_0.1.0_aarch64.dmg` - Apple Silicon
- `VPS Studio_0.1.0_x64.dmg` - Intel

#### Code Signing

For distribution outside the App Store:

1. Obtain an Apple Developer ID certificate
2. Configure in `tauri.conf.json`:

```json
{
  "bundle": {
    "macOS": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": "entitlements.plist"
    }
  }
}
```

#### Notarization

For macOS 10.15+ compatibility:

1. Create an App-Specific Password
2. Set environment variables:

```bash
export APPLE_ID="your@apple.id"
export APPLE_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="your-team-id"
```

3. Build and notarize:

```bash
npm run tauri build
xcrun notarytool submit --apple-id "$APPLE_ID" --password "$APPLE_PASSWORD" --team-id "$APPLE_TEAM_ID" --wait
```

### Linux

#### Prerequisites

- Ubuntu 20.04+ or equivalent
- Platform dependencies (see [Installation Guide](installation.md))

#### Build

```bash
npm run tauri build
```

#### Output

- `vps-studio_0.1.0_amd64.deb` - Debian/Ubuntu package
- `vps-studio-0.1.0.AppImage` - Universal Linux

#### Debian Package

The `.deb` package can be installed:

```bash
sudo dpkg -i vps-studio_0.1.0_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

#### AppImage

The `.AppImage` is self-contained:

```bash
chmod +x vps-studio-0.1.0.AppImage
./vps-studio-0.1.0.AppImage
```

## Distribution

### GitHub Releases

Create a GitHub release with all platform artifacts:

1. **Create a tag**
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```

2. **Build all platforms** (using CI/CD)

3. **Upload artifacts** to GitHub release

4. **Write release notes** (auto-generated from changelog)

### Website Distribution

Host downloads on your website:

```html
<div class="download-buttons">
  <a href="/downloads/vps-studio-0.1.0.exe">Windows</a>
  <a href="/downloads/vps-studio-0.1.0.dmg">macOS</a>
  <a href="/downloads/vps-studio-0.1.0.deb">Linux (Debian)</a>
  <a href="/downloads/vps-studio-0.1.0.AppImage">Linux (Universal)</a>
</div>
```

### Package Managers

#### Homebrew (macOS)

Create a Homebrew formula:

```ruby
class VpsStudio < Formula
  desc "Desktop application for managing Linux servers over SSH"
  homepage "https://github.com/v0idjs/VPS-Studio"
  url "https://github.com/v0idjs/VPS-Studio/releases/download/v0.1.0/VPS.Studio_0.1.0_aarch64.dmg"
  sha256 "..."
  version "0.1.0"

  def install
    app.install "VPS Studio.app"
  end
end
```

#### APT Repository (Debian/Ubuntu)

1. Host the `.deb` package on a web server
2. Create a repository:

```bash
# Install dpkg-scanpackages
sudo apt-get install dpkg-dev

# Create repository structure
mkdir -p dists/stable/main/binary-amd64

# Generate Packages file
dpkg-scanpackages dists/stable/main/binary-amd64 /dev/null | gzip -9 > dists/stable/main/binary-amd64/Packages.gz
```

3. Add repository to users' systems:

```bash
echo "deb https://your-repo.com stable main" | sudo tee /etc/apt/sources.list.d/vps-studio.list
wget -qO - https://your-repo.com/key.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install vps-studio
```

## Updates

### Auto-Update

Tauri supports built-in auto-updates:

1. **Configure update server** in `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://releases.your-app.com/{{target}}/{{arch}}/{{current_version}}"
      ],
      "pubkey": "YOUR_UPDATER_PUBLIC_KEY"
    }
  }
}
```

2. **Generate signing keys**:

```bash
npx tauri signer generate -w ~/.vps-studio.key
```

3. **Check for updates**:

```typescript
import { check } from '@tauri-apps/plugin-updater';

const update = await check();
if (update) {
  await update.downloadAndInstall();
}
```

### Manual Updates

Users can download new versions from:
- GitHub Releases
- Your website
- Package managers

## Troubleshooting

### Build Fails

#### Windows

- **WebView2 not found**: Install WebView2 runtime
- **NSIS error**: Ensure NSIS is installed
- **Path too long**: Use shorter project path

#### macOS

- **Code signing error**: Verify certificate and provisioning profile
- **Notarization failed**: Check Apple ID credentials
- **Gatekeeper blocking**: Ensure proper code signing

#### Linux

- **Missing dependencies**: Install platform-specific packages
- **Permission denied**: Use `chmod +x` on AppImage
- **Library errors**: Check library versions

### Runtime Issues

#### Application Won't Start

1. Check system requirements
2. Verify installation
3. Check permissions
4. Review logs

#### SSH Connection Fails

1. Verify server accessibility
2. Check SSH credentials
3. Review firewall rules
4. Test with SSH client directly

### Logs

Application logs are stored in:

| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/vps-studio/logs/` |
| **macOS** | `~/Library/Logs/vps-studio/` |
| **Linux** | `~/.local/share/vps-studio/logs/` |

## CI/CD

### GitHub Actions

The repository includes GitHub Actions workflows for:

- **CI**: Build and test on push/PR
- **Release**: Build and publish on tag push

### Workflow Configuration

See `.github/workflows/` for workflow files.

### Secrets

Configure these secrets in GitHub:

- `APPLE_ID`: Apple Developer ID
- `APPLE_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Apple Team ID
- `TAURI_SIGNING_PRIVATE_KEY`: Tauri updater key
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Key password

## Performance

### Build Optimization

```toml
# src-tauri/Cargo.toml
[profile.release]
strip = true
lto = true
codegen-units = 1
panic = "abort"
```

### Binary Size

- Enable LTO (link-time optimization)
- Strip debug symbols
- Use release profile optimizations

### Startup Time

- Minimize initialization code
- Use lazy loading
- Optimize database queries

## Security

### Production Security Checklist

- [ ] Code signing enabled
- [ ] Auto-updater configured
- [ ] CSP enabled
- [ ] No debug features in release
- [ ] Sensitive data encrypted
- [ ] No hardcoded secrets

### Security Updates

1. Monitor dependencies for vulnerabilities
2. Update regularly
3. Test updates before release
4. Communicate security fixes

## Resources

- [Tauri Build Guide](https://tauri.app/v1/guides/distribution/)
- [Apple Developer](https://developer.apple.com/)
- [Microsoft Store](https://developer.microsoft.com/en-us/windows/)
- [Linux Packaging](https://www.debian.org/doc/manuals/debian-policy/)
