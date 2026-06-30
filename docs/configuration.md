# Configuration Guide

This guide explains how to configure VPS Studio to suit your needs.

## Table of Contents

- [Application Settings](#application-settings)
- [SSH Configuration](#ssh-configuration)
- [Database Configuration](#database-configuration)
- [Security Settings](#security-settings)
- [Environment Variables](#environment-variables)

## Application Settings

Access settings by clicking the gear icon in the sidebar.

### General Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Theme** | Application theme (Dark/Light/System) | Dark |
| **Language** | Application language | English |
| **Start with OS** | Launch app on system startup | Disabled |
| **Minimize to tray** | Minimize to system tray | Enabled |

### SSH Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Default SSH Port** | Default port for new servers | 22 |
| **Connection Timeout** | SSH connection timeout (seconds) | 30 |
| **Keep Alive Interval** | SSH keep-alive interval (seconds) | 60 |
| **Preferred Auth** | Preferred authentication method | Key-based |

### Performance Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Process Refresh Rate** | Process list auto-refresh interval | 5 seconds |
| **Status Polling Interval** | Server status polling interval | 30 seconds |
| **Log Buffer Size** | Maximum log entries to display | 1000 |
| **Enable Animations** | Enable UI animations | Enabled |

## SSH Configuration

### SSH Keys

VPS Studio uses SSH keys for authentication by default.

#### Generating SSH Keys

1. Go to **SSH Keys** in the sidebar
2. Click **Generate Key**
3. Choose key type (RSA, Ed25519, ECDSA)
4. Enter key name and optional passphrase
5. Click **Generate**

#### Importing SSH Keys

1. Go to **SSH Keys** in the sidebar
2. Click **Import Key**
3. Paste your public key or select a file
4. Click **Import**

#### Exporting SSH Keys

1. Go to **SSH Keys** in the sidebar
2. Select the key to export
3. Click **Export**
4. Choose export location

### SSH Configuration File

VPS Studio can read your `~/.ssh/config` file:

```
Host my-server
    HostName 192.168.1.100
    User admin
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

### Authentication Methods

#### Key-based Authentication (Recommended)

1. Generate or import an SSH key
2. Add the public key to the server:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
   ```
3. Add the server in VPS Studio with the key selected

#### Password Authentication

1. Add the server in VPS Studio
2. Enter username and password
3. Password is encrypted and stored securely

## Database Configuration

### Database Location

| Platform | Default Location |
|----------|------------------|
| **Windows** | `%APPDATA%/v0idjs/VPS-Studio.db` |
| **macOS** | `~/Library/Application Support/v0idjs/VPS-Studio.db` |
| **Linux** | `~/.local/share/v0idjs/VPS-Studio.db` |

### Backup Database

1. Go to **Settings** > **Data Management**
2. Click **Backup Database**
3. Choose backup location
4. Confirm backup

### Restore Database

1. Go to **Settings** > **Data Management**
2. Click **Restore Database**
3. Select backup file
4. Confirm restore

### Export Data

Export your data as JSON:

1. Go to **Settings** > **Data Management**
2. Click **Export Data**
3. Choose export location
4. Data will be exported as JSON

### Import Data

Import data from JSON:

1. Go to **Settings** > **Data Management**
2. Click **Import Data**
3. Select JSON file
4. Confirm import

## Security Settings

### Encryption

All sensitive data is encrypted using AES-256-GCM:

- SSH passwords
- API tokens
- Private keys (if stored)

### Keychain Integration

Encryption keys are stored in your OS keychain:

- **Windows**: Windows Credential Manager
- **macOS**: macOS Keychain
- **Linux**: Secret Service (GNOME Keyring, KWallet)

### Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Enable firewall** on your servers
3. **Keep VPS Studio updated** to the latest version
4. **Regular backups** of your database
5. **Review server access** periodically

## Environment Variables

You can configure VPS Studio using environment variables:

### Development Variables

Create a `.env` file in the project root:

```bash
# Application title
VITE_APP_TITLE="VPS Studio"

# Default SSH port
VITE_DEFAULT_SSH_PORT=22

# Window dimensions
VITE_WINDOW_WIDTH=1280
VITE_WINDOW_HEIGHT=720

# Feature flags
VITE_ENABLE_DOCKER=true
VITE_ENABLE_FIREWALL=true
```

### Production Variables

For production builds, set environment variables before building:

```bash
# Windows
set VITE_APP_TITLE="VPS Studio"
npm run tauri build

# macOS/Linux
VITE_APP_TITLE="VPS Studio" npm run tauri build
```

## Configuration Files

### Rust Configuration

- `src-tauri/rustfmt.toml` - Code formatting rules
- `src-tauri/clippy.toml` - Linting rules

### Frontend Configuration

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration

## Troubleshooting Configuration

### Settings Not Saving

- Check file permissions
- Verify database is writable
- Check disk space

### SSH Connection Issues

- Verify SSH key permissions (600 for private, 644 for public)
- Check firewall rules
- Verify SSH service is running

### Performance Issues

- Adjust refresh rates in settings
- Reduce log buffer size
- Disable animations

For more help, see the [FAQ](faq.md) or [open an issue](https://github.com/v0idjs/VPS-Studio/issues).
