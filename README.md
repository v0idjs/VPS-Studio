# VPS Studio

<div align="center">

**A modern, local-first desktop application for managing Linux servers over SSH.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/v0idjs/VPS-Studio/releases)
[![CI](https://github.com/v0idjs/VPS-Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/v0idjs/VPS-Studio/actions/workflows/ci.yml)
[![GitHub Stars](https://img.shields.io/github/stars/v0idjs/VPS-Studio)](https://github.com/v0idjs/VPS-Studio/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/v0idjs/VPS-Studio)](https://github.com/v0idjs/VPS-Studio/issues)
[![Downloads](https://img.shields.io/github/downloads/v0idjs/VPS-Studio/total)](https://github.com/v0idjs/VPS-Studio/releases)

<p align="center">
  <strong>Windows</strong> • <strong>macOS</strong> • <strong>Linux</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

</div>

---

## About

VPS Studio is a powerful, local-first desktop application designed for system administrators and developers who manage Linux servers. Built with Tauri (Rust + React/TypeScript), it provides a modern dark-mode UI for comprehensive server management without any cloud dependency or account system.

**Your data stays on your machine. Always.**

## Screenshots

<div align="center">

![Dashboard](docs/images/dashboard.png)
*Server Dashboard with real-time monitoring*

![Terminal](docs/images/terminal.png)
*Multi-tab terminal with SSH sessions*

![File Manager](docs/images/files.png)
*Remote file management with SFTP*

</div>

## Features

### Server Management
- **Dashboard** — Real-time CPU, memory, disk, and network monitoring with charts
- **Server List** — Search, filter, and organize servers by groups
- **Status Monitoring** — Automatic server status polling (online/offline)

### Terminal & SSH
- **Terminal Sessions** — Full xterm.js terminal with multiple tab support
- **SSH Connection Management** — Connect to servers with key or password authentication
- **Terminal Themes** — Customizable terminal appearance

### File Management
- **File Explorer** — Browse remote files with tree view
- **File Editor** — Edit remote files with syntax highlighting
- **File Operations** — Upload, download, rename, move, copy, delete
- **File Bookmarks** — Save frequently accessed directories

### Process & Service Management
- **Process List** — View and kill running processes (SIGTERM/SIGKILL)
- **Service Control** — Start, stop, restart, enable, disable systemd services
- **Process Monitoring** — Auto-refresh with configurable intervals

### Docker Management
- **Container Management** — Start, stop, restart, remove containers
- **Image Management** — Pull and remove Docker images
- **Container Logs** — View container output logs

### Package Management
- **Package Search** — Search available packages
- **Package Install/Remove** — Install and remove packages via apt/yum
- **Package List** — View installed packages

### Cron Jobs
- **Cron Job List** — View all scheduled cron jobs
- **Add/Edit Jobs** — Create and modify cron schedules
- **Remove Jobs** — Delete scheduled tasks

### SSH Key Management
- **Key Generation** — Generate RSA, Ed25519, or ECDSA keys
- **Key Import/Export** — Import and export public keys
- **Key List** — View and manage SSH keys

### Firewall Management
- **UFW/iptables Rules** — View and manage firewall rules
- **Rule Management** — Add and remove firewall rules
- **Enable/Disable** — Toggle firewall status

### Log Viewer
- **Remote Logs** — Read journalctl, syslog, auth.log, nginx logs
- **Log Filtering** — Filter by level, service, and search terms
- **Log Export** — Export logs to text files

### Snapshots
- **System Snapshots** — Capture system state (packages, services, network, disk)
- **Snapshot Comparison** — Compare current system with previous snapshots
- **Snapshot History** — View snapshot history

### Command Library
- **Command Storage** — Save frequently used commands
- **Command Categories** — Organize commands by category
- **Command Execution** — Execute saved commands with history

### Notifications
- **Notification Rules** — Create rules for server events
- **Desktop Notifications** — Receive desktop notifications
- **Notification History** — View notification history

### Workspace Management
- **Workspaces** — Organize servers into workspaces
- **Color Coding** — Color-code workspaces for easy identification
- **Server Assignment** — Assign servers to multiple workspaces

### Settings & Polish
- **Settings Panel** — Configure UI preferences, SSH defaults, performance settings
- **Dark Mode** — Full dark mode support
- **Keyboard Shortcuts** — Navigate with keyboard shortcuts
- **Tooltips** — Helpful tooltips throughout the UI
- **Error Boundaries** — Graceful error handling
- **Loading States** — Loading indicators for all async operations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Shell** | [Tauri 2](https://tauri.app/) |
| **Frontend** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **State Management** | [Zustand 4](https://zustand-demo.pmnd.rs/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Terminal** | [xterm.js](https://xtermjs.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend** | [Rust](https://www.rust-lang.org/) (2021 Edition) |
| **Database** | [SQLite](https://www.sqlite.org/) (via rusqlite) |
| **SSH Client** | [ssh2](https://docs.rs/ssh2) |
| **Encryption** | [AES-256-GCM](https://docs.rs/aes-gcm) |
| **Keychain** | [keyring](https://docs.rs/keyring) |

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (v1.70 or higher)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)
- [Git](https://git-scm.com/)

### Platform-Specific Dependencies

#### Windows
No additional dependencies required.

#### macOS
No additional dependencies required (Xcode Command Line Tools recommended).

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

## Installation

### Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/v0idjs/VPS-Studio/releases) page.

- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.deb` package or `.AppImage`

### Build from Source

1. **Clone the repository**

   ```bash
   git clone https://github.com/v0idjs/VPS-Studio.git
   cd vps-studio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development**

   ```bash
   npm run tauri dev
   ```

4. **Build for production**

   ```bash
   npm run tauri build
   ```

   The built application will be in `src-tauri/target/release/bundle/`.

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend (TypeScript + Vite) |
| `npm run preview` | Preview frontend build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run tauri dev` | Start Tauri development mode |
| `npm run tauri build` | Build Tauri application |

### Project Structure

```
vps-studio/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   ├── lib.rs            # Library exports
│   │   ├── db/               # SQLite data access
│   │   │   ├── mod.rs        # DB initialization
│   │   │   ├── schema.rs     # Table definitions
│   │   │   ├── migrations.rs # Migration runner
│   │   │   ├── crypto.rs     # AES-256-GCM encryption
│   │   │   ├── keychain.rs   # OS keychain integration
│   │   │   ├── migrations/   # SQL migration files
│   │   │   └── queries/      # Database queries
│   │   ├── ssh/              # SSH connection management
│   │   │   ├── mod.rs        # SSH module exports
│   │   │   ├── connection.rs # SSH session lifecycle
│   │   │   ├── sftp.rs       # SFTP operations
│   │   │   ├── processes.rs  # Process management
│   │   │   ├── services.rs   # Service management
│   │   │   ├── docker.rs     # Docker operations
│   │   │   ├── packages.rs   # Package management
│   │   │   ├── cron.rs       # Cron job operations
│   │   │   ├── keys.rs       # SSH key operations
│   │   │   ├── firewall.rs   # Firewall operations
│   │   │   ├── logs.rs       # Log reading
│   │   │   ├── snapshots.rs  # Snapshot operations
│   │   │   ├── commands.rs   # Command execution
│   │   │   └── workspaces.rs # Workspace operations
│   │   ├── commands/         # Tauri command handlers
│   │   │   ├── mod.rs        # Command module exports
│   │   │   ├── servers.rs    # Server CRUD commands
│   │   │   ├── dashboard.rs  # Dashboard commands
│   │   │   ├── terminal.rs   # Terminal session commands
│   │   │   ├── files.rs      # File operations
│   │   │   ├── processes.rs  # Process commands
│   │   │   ├── services.rs   # Service commands
│   │   │   ├── docker.rs     # Docker commands
│   │   │   ├── packages.rs   # Package commands
│   │   │   ├── cron.rs       # Cron commands
│   │   │   ├── ssh_keys.rs   # SSH key commands
│   │   │   ├── firewall.rs   # Firewall commands
│   │   │   ├── logs.rs       # Log commands
│   │   │   ├── snapshots.rs  # Snapshot commands
│   │   │   ├── command_library.rs # Command library
│   │   │   ├── workspaces.rs # Workspace commands
│   │   │   └── settings/     # Settings commands
│   │   ├── notifications/    # Desktop notifications
│   │   └── terminal.rs       # Terminal event setup
│   ├── Cargo.toml            # Rust dependencies
│   ├── tauri.conf.json       # Tauri configuration
│   ├── rustfmt.toml          # Rust formatting config
│   └── clippy.toml           # Rust linting config
├── src/                       # React frontend
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   ├── styles/
│   │   └── globals.css       # Global styles + Tailwind
│   ├── stores/
│   │   └── app-store.ts      # Zustand state management
│   ├── hooks/
│   │   └── use-ipc.ts        # Tauri IPC wrapper functions
│   ├── lib/
│   │   ├── types.ts          # Core TypeScript interfaces
│   │   ├── events.ts         # Tauri event listeners
│   │   ├── terminal-themes.ts # Terminal theme definitions
│   │   └── *-types.ts        # Feature-specific types
│   └── components/
│       ├── ui/               # Base UI components
│       ├── layout/           # Layout components
│       ├── common/           # Shared components
│       ├── servers/          # Server management
│       ├── dashboard/        # Dashboard components
│       ├── terminal/         # Terminal components
│       ├── files/            # File manager
│       ├── processes/        # Process management
│       ├── services/         # Service management
│       ├── docker/           # Docker management
│       ├── packages/         # Package management
│       ├── cron/             # Cron job management
│       ├── ssh-keys/         # SSH key management
│       ├── firewall/         # Firewall management
│       ├── logs/             # Log viewer
│       ├── snapshots/        # System snapshots
│       ├── commands/         # Command library
│       ├── notifications/    # Notifications
│       ├── workspaces/       # Workspace management
│       └── settings/         # Settings panel
├── docs/                      # Documentation
├── tests/                     # Test files
├── specs/                     # Spec documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### Code Quality

We maintain high code quality standards:

- **TypeScript**: Full type safety for all frontend code
- **ESLint**: Linting for TypeScript/React code
- **Prettier**: Consistent code formatting
- **Clippy**: Rust linting for backend code
- **rustfmt**: Rust code formatting

Run all checks:

```bash
# Frontend
npm run typecheck
npm run lint
npm run format

# Backend
cd src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features
```

## Configuration

### SSH Configuration

VPS Studio uses your local SSH configuration (`~/.ssh/config`) for authentication. You can also configure SSH keys and passwords through the application.

### Database

All data is stored locally in SQLite:

| Platform | Path |
|----------|------|
| **Windows** | `%APPDATA%/v0idjs/VPS-Studio.db` |
| **macOS** | `~/Library/Application Support/v0idjs/VPS-Studio.db` |
| **Linux** | `~/.local/share/v0idjs/VPS-Studio.db` |

### Encryption

Sensitive data (SSH passwords, API keys) is encrypted using AES-256-GCM with keys stored in your OS keychain:

- **Windows**: Windows Credential Manager
- **macOS**: macOS Keychain
- **Linux**: Secret Service (GNOME Keyring, KWallet)

## Security

VPS Studio is designed with security as a core principle:

- **Local-first**: No data leaves your machine
- **No cloud**: No account system or cloud sync
- **Encryption**: Sensitive data encrypted at rest with AES-256-GCM
- **Keychain**: Encryption keys stored in OS keychain
- **SSH-only**: No agent installed on servers
- **Open source**: Fully auditable codebase
- **Input validation**: Strict allowlists for all user inputs (service names, container IDs, IPs, ports, SSH key types, kill signals)
- **Path traversal protection**: Sanitized filenames prevent directory traversal attacks
- **CSP enabled**: Content Security Policy restricts script execution sources
- **Secure defaults**: DB files created with 0600 permissions on Unix systems
- **Credential encryption**: Server passwords and SSH keys encrypted with AES-256-GCM before storage
- **Real SSH terminal**: Terminal sessions establish genuine SSH connections with PTY support

For more details, see our [Security Policy](SECURITY.md).

## Documentation

- [Installation Guide](docs/installation.md)
- [Configuration Guide](docs/configuration.md)
- [Architecture Overview](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [FAQ](docs/faq.md)
- [Changelog](CHANGELOG.md)

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Issue Templates](https://github.com/v0idjs/VPS-Studio/issues/new/choose)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tauri](https://tauri.app/) - Desktop application framework
- [React](https://react.dev/) - UI library
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library

---

<div align="center">

**[Report Bug](https://github.com/v0idjs/VPS-Studio/issues/new?template=bug_report.md)** • **[Request Feature](https://github.com/v0idjs/VPS-Studio/issues/new?template=feature_report.md)** • **[Ask Question](https://github.com/v0idjs/VPS-Studio/issues/new?template=question.md)**

</div>
