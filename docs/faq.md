# Frequently Asked Questions

## General

### What is VPS Studio?

VPS Studio is a local-first desktop application for managing Linux servers over SSH. It provides a modern dark-mode UI for server management without any cloud dependency.

### Is VPS Studio free?

Yes, VPS Studio is free and open-source under the MIT License.

### What platforms are supported?

VPS Studio supports:
- **Windows** 10+ (64-bit)
- **macOS** 11+ (Apple Silicon and Intel)
- **Linux** (Ubuntu 20.04+, Debian 11+, Fedora 35+, Arch Linux)

### Does VPS Studio collect my data?

No. VPS Studio is local-first and does not collect, transmit, or store any data externally. All data stays on your machine.

### Is VPS Studio secure?

Yes. VPS Studio uses:
- AES-256-GCM encryption for sensitive data
- OS keychain for key storage
- Local-only data storage
- SSH for server communication

## Installation

### How do I install VPS Studio?

See the [Installation Guide](installation.md) for detailed instructions.

### Do I need to install Node.js or Rust?

- **To run the app**: No
- **To build from source**: Yes

### How do I update VPS Studio?

Download the latest version from [Releases](https://github.com/v0idjs/VPS-Studio/releases) and install it over the existing version.

## Usage

### How do I add a server?

1. Click the "+" button in the sidebar
2. Enter server details (hostname, SSH port, username)
3. Choose authentication method (SSH key or password)
4. Click "Connect"

### Can I use multiple SSH keys?

Yes. VPS Studio supports multiple SSH keys. You can:
- Generate new keys
- Import existing keys
- Assign different keys to different servers

### Does VPS Studio support password authentication?

Yes, but SSH key authentication is strongly recommended for security.

### Can I customize the terminal?

Yes. VPS Studio includes multiple terminal themes and customizable settings.

### How do I backup my data?

1. Go to **Settings** > **Data Management**
2. Click **Backup Database**
3. Choose backup location

### Can I organize servers into groups?

Yes. Use **Workspaces** to organize servers into logical groups.

## Troubleshooting

### The app won't start

1. Check system requirements
2. Verify installation
3. Check firewall settings
4. Review error logs

### SSH connection fails

1. Verify server hostname/IP
2. Check SSH port (default: 22)
3. Ensure SSH service is running
4. Verify credentials or SSH key

### Build fails

See the [Development Guide](development.md) for troubleshooting steps.

### Where are logs stored?

| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/vps-studio/logs/` |
| **macOS** | `~/Library/Logs/vps-studio/` |
| **Linux** | `~/.local/share/vps-studio/logs/` |

## Features

### Does VPS Studio support Docker?

Yes. VPS Studio can manage Docker containers and images on remote servers.

### Can I use VPS Studio with non-Linux servers?

VPS Studio is designed for Linux servers. It may work with other Unix-like systems but is not officially supported.

### Does VPS Studio support multiple windows?

Currently, VPS Studio uses a single-window design with a sidebar for navigation.

### Can I customize the theme?

Yes. VPS Studio includes a dark mode and multiple terminal themes.

## Development

### How do I contribute?

See the [Contributing Guide](../CONTRIBUTING.md) for details.

### How do I run tests?

```bash
# Frontend tests
npm run test

# Backend tests
cd src-tauri && cargo test
```

### Where is the documentation?

Documentation is available in the `docs/` directory:
- [Installation Guide](installation.md)
- [Configuration Guide](configuration.md)
- [Architecture Overview](architecture.md)
- [Development Guide](development.md)
- [Deployment Guide](deployment.md)

### How do I report bugs?

Use the [Bug Report template](https://github.com/v0idjs/VPS-Studio/issues/new?template=bug_report.md) on GitHub.

### How do I request features?

Use the [Feature Request template](https://github.com/v0idjs/VPS-Studio/issues/new?template=feature_request.md) on GitHub.

## Security

### How do I report security vulnerabilities?

See the [Security Policy](../SECURITY.md) for responsible disclosure instructions.

### Is my password stored securely?

Passwords are encrypted using AES-256-GCM and stored in the local database. The encryption key is stored in your OS keychain.

### Can VPS Studio access my SSH keys?

VPS Studio uses your SSH keys for authentication. Keys are not copied or stored separately.

## Support

### Where can I get help?

- [Documentation](/)
- [GitHub Issues](https://github.com/v0idjs/VPS-Studio/issues)
- [Discussions](https://github.com/v0idjs/VPS-Studio/discussions)

### Is there a community?

Join the discussion on [GitHub Discussions](https://github.com/v0idjs/VPS-Studio/discussions).

## Licensing

### What license is VPS Studio under?

VPS Studio is licensed under the [MIT License](../LICENSE).

### Can I use VPS Studio commercially?

Yes. The MIT License allows commercial use.

### Do I need to attribution?

Attribution is appreciated but not required by the MIT License.
