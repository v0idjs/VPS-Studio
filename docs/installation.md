# Installation Guide

This guide will help you install VPS Studio on your system.

## Table of Contents

- [System Requirements](#system-requirements)
- [Download Pre-built Binaries](#download-pre-built-binaries)
- [Build from Source](#build-from-source)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [First Launch](#first-launch)

## System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 11+, or Ubuntu 20.04+
- **RAM**: 4 GB
- **Storage**: 500 MB available space
- **Display**: 1280x720 resolution

### Recommended Requirements

- **OS**: Windows 11, macOS 14+, or Ubuntu 22.04+
- **RAM**: 8 GB or more
- **Storage**: 1 GB available space
- **Display**: 1920x1080 resolution or higher

## Download Pre-built Binaries

### Windows

1. Download the `.exe` installer from [Releases](https://github.com/v0idjs/VPS-Studio/releases)
2. Run the installer
3. Follow the installation wizard
4. Launch VPS Studio from Start Menu

### macOS

1. Download the `.dmg` file from [Releases](https://github.com/v0idjs/VPS-Studio/releases)
2. Open the `.dmg` file
3. Drag VPS Studio to Applications folder
4. Launch VPS Studio from Applications

**Note**: On macOS, you may need to allow the app in System Preferences > Security & Privacy.

### Linux

#### Ubuntu/Debian (.deb)

```bash
# Download the .deb package
wget https://github.com/v0idjs/VPS-Studio/releases/latest/download/vps-studio_0.1.0_amd64.deb

# Install the package
sudo dpkg -i vps-studio_0.1.0_amd64.deb

# Fix any dependency issues
sudo apt-get install -f
```

#### AppImage (All Linux Distributions)

```bash
# Download the AppImage
wget https://github.com/v0idjs/VPS-Studio/releases/latest/download/vps-studio-0.1.0.AppImage

# Make it executable
chmod +x vps-studio-0.1.0.AppImage

# Run the AppImage
./vps-studio-0.1.0.AppImage
```

## Build from Source

### Prerequisites

Install the required tools:

#### Node.js
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

#### Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### Git
```bash
# Ubuntu/Debian
sudo apt-get install git

# macOS (Xcode Command Line Tools)
xcode-select --install

# Windows
# Download from https://git-scm.com/
```

### Platform-Specific Dependencies

#### Windows
No additional dependencies required.

#### macOS
```bash
xcode-select --install
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

#### Fedora
```bash
sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel patchelf
```

#### Arch Linux
```bash
sudo pacman -S webkit2gtk-4.1 appmenu-gtk-module libappindicator-gtk3 librsvg patchelf
```

### Build Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/v0idjs/VPS-Studio.git
   cd vps-studio
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Start development mode**

   ```bash
   npm run tauri dev
   ```

4. **Build for production**

   ```bash
   npm run tauri build
   ```

   The built application will be in `src-tauri/target/release/bundle/`.

## Platform-Specific Instructions

### Windows

- **Firewall**: Windows Defender may prompt you to allow the app. Click "Allow access".
- **Antivirus**: Some antivirus software may flag the app. This is a false positive.
- **Path Length**: Ensure the project path is short (e.g., `C:\Projects\vps-studio`) to avoid path length issues.

### macOS

- **Gatekeeper**: On first launch, right-click the app and select "Open" to bypass Gatekeeper.
- **Permissions**: Grant necessary permissions when prompted (network access, keychain access).
- **Xcode**: Install Xcode Command Line Tools for building from source.

### Linux

- **Display Server**: Works with X11 and Wayland.
- **Dependencies**: Ensure all platform-specific dependencies are installed.
- **Permissions**: Some features may require sudo access on the remote server.

## First Launch

1. **Launch VPS Studio**
   - Windows: Start Menu or desktop shortcut
   - macOS: Applications folder
   - Linux: Application menu or command line

2. **Add Your First Server**
   - Click the "+" button in the sidebar
   - Enter server details (hostname, SSH port, username)
   - Choose authentication method (SSH key recommended)
   - Click "Connect"

3. **Explore the Dashboard**
   - View server status and metrics
   - Navigate through the sidebar menu
   - Customize your workspace

## Troubleshooting

### Build Fails

- Ensure all prerequisites are installed
- Check Node.js version (v18+ required)
- Check Rust version (v1.70+ required)
- Verify platform-specific dependencies

### App Won't Launch

- Check system requirements
- Verify app permissions
- Check firewall settings
- Review error logs

### SSH Connection Fails

- Verify server hostname/IP
- Check SSH port (default: 22)
- Ensure SSH service is running
- Verify credentials or SSH key

For more help, see the [FAQ](faq.md) or [open an issue](https://github.com/v0idjs/VPS-Studio/issues).
