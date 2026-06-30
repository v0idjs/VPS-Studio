# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Input validation module (`validation.rs`) with strict allowlists for service names, container IDs, image names, SSH key types, firewall protocols, ports, IPs, kill signals, and log sources
- Path traversal protection via `sanitize_filename()` helper
- `with_sftp()` helper to eliminate SFTP connection boilerplate in file operations
- `row_to_server()` helper to eliminate duplicated Server struct mapping
- `execute_on_server_with_status()` to use SSH exit code for command success detection
- DB file permissions set to 0600 on Unix systems
- Content Security Policy (CSP) enabled in Tauri config
- Real SSH terminal sessions with PTY allocation (was previously a stub)
- Server credential encryption and storage (password, private_key, passphrase)
- Server `password`, `private_key`, `passphrase` fields returned from backend (sensitive values redacted)

### Fixed
- **CRITICAL**: Database schema ID type mismatch — changed all tables from `INTEGER AUTOINCREMENT` to `TEXT PRIMARY KEY` to match UUID-based Rust IDs
- **CRITICAL**: Terminal sessions now establish real SSH connections with PTY (was previously a no-op stub that created empty sessions)
- **HIGH**: Server credentials (`password`, `private_key`, `passphrase`) now encrypted and stored in DB (were previously accepted but silently discarded)
- **HIGH**: Added `get_service_status` to Tauri invoke handler (was defined but not registered)
- Fixed `SshConnection.session` field visibility (`pub(crate)`)
- Fixed ssh2 0.9 API mismatches in `sftp.rs` (`rm`→`unlink`, `rename` takes 3 args, `FileStat` field access)
- Fixed duplicate type definitions between `commands::dashboard` and `db::queries::dashboard`
- Fixed duplicate `FileInfo` type between `commands::files` and `ssh::sftp`
- Fixed missing `pub mod` declarations in `commands/mod.rs` (17 modules), `ssh/mod.rs` (10 modules), `notifications/mod.rs` (2 modules)
- Fixed `settings.rs`/`settings/` directory conflict
- Fixed `aes_gcm::Error` not implementing `StdError`
- Fixed all broken import paths across the codebase

### Security
- **CRITICAL**: Enabled Content Security Policy (CSP) — was previously disabled (`null`)
- **HIGH**: Added input validation to all shell command construction (firewall rules, service names, Docker container IDs, SSH key types, kill signals, log sources)
- **HIGH**: Added path traversal protection to workspace, notification, and command library file operations
- **HIGH**: Fixed command success detection to use SSH exit code instead of string matching for "error"
- **HIGH**: Server credentials encrypted with AES-256-GCM before storage
- **MEDIUM**: Set SQLite database file permissions to 0600 on Unix systems
- **MEDIUM**: Added input validation for settings key names

### Changed
- Refactored `servers.rs` to use shared `row_to_server()` helper (removed 5 duplicated 11-field mappings)
- Refactored `files.rs` to use shared `with_sftp()` helper (removed 8 duplicated SFTP connection blocks)
- Refactored `docker.rs` to consolidate 4 identical container action functions into one `docker_action()` helper
- Added `regex` and `lazy_static` dependencies to Cargo.toml
- Terminal backend now uses real SSH sessions via `ssh2` crate with background I/O threads
- Server struct now includes credential fields (password, private_key, passphrase) as `Option<String>`

## [0.1.0] - 2026-06-30

### Added

#### Core Features
- **Server Management**: Add, edit, delete, and organize Linux servers
- **SSH Connections**: Secure SSH connection with key and password authentication
- **Real-time Monitoring**: Dashboard with CPU, memory, disk, and network charts
- **Server Status**: Automatic online/offline status detection

#### Terminal
- **Multi-tab Terminal**: Full xterm.js terminal with multiple session support
- **SSH Terminal**: Direct SSH terminal sessions
- **Terminal Themes**: Customizable terminal appearance

#### File Management
- **File Explorer**: Browse remote files with tree view
- **File Editor**: Edit remote files with syntax highlighting
- **File Operations**: Upload, download, rename, move, copy, delete
- **File Bookmarks**: Save frequently accessed directories

#### Process Management
- **Process List**: View all running processes
- **Process Kill**: Send SIGTERM or SIGKILL to processes
- **Auto-refresh**: Configurable process list refresh

#### Service Management
- **Service List**: View all systemd services
- **Service Control**: Start, stop, restart, enable, disable
- **Service Logs**: View service output logs

#### Docker Management
- **Container Management**: Start, stop, restart, remove containers
- **Image Management**: Pull and remove Docker images
- **Container Logs**: View container output

#### Package Management
- **Package List**: View installed packages
- **Package Search**: Search available packages
- **Package Operations**: Install and remove packages

#### Cron Jobs
- **Cron Job List**: View all scheduled cron jobs
- **Cron Job Management**: Add and remove cron jobs

#### SSH Key Management
- **Key Generation**: Generate RSA, Ed25519, or ECDSA keys
- **Key Import/Export**: Import and export public keys
- **Key Management**: View and manage SSH keys

#### Firewall Management
- **Firewall Rules**: View UFW/iptables rules
- **Rule Management**: Add and remove firewall rules
- **Firewall Control**: Enable and disable firewall

#### Log Viewer
- **Remote Logs**: Read journalctl, syslog, auth.log, nginx logs
- **Log Filtering**: Filter by level, service, and search terms
- **Log Export**: Export logs to text files

#### Snapshots
- **System Snapshots**: Capture system state
- **Snapshot Comparison**: Compare current system with previous snapshots

#### Command Library
- **Command Storage**: Save frequently used commands
- **Command Categories**: Organize commands by category
- **Command Execution**: Execute saved commands with history

#### Notifications
- **Notification Rules**: Create rules for server events
- **Desktop Notifications**: Receive desktop notifications
- **Notification History**: View notification history

#### Workspace Management
- **Workspaces**: Organize servers into workspaces
- **Color Coding**: Color-code workspaces
- **Server Assignment**: Assign servers to multiple workspaces

#### Settings
- **Settings Panel**: Configure UI preferences, SSH defaults, performance settings
- **Dark Mode**: Full dark mode support
- **Keyboard Shortcuts**: Navigate with keyboard shortcuts

#### Developer Experience
- **TypeScript**: Full type safety
- **ESLint + Prettier**: Code quality and formatting
- **Hot Reload**: Fast development iteration
- **Comprehensive Documentation**: README, contributing guide, security policy

#### UI/UX
- **Tooltips**: Helpful tooltips throughout the UI
- **Error Boundaries**: Graceful error handling
- **Loading States**: Loading indicators for all async operations
- **Responsive Design**: Adapts to different window sizes

### Security
- AES-256-GCM encryption for sensitive data
- OS keychain integration for key storage
- Local-only data architecture
- No cloud dependencies
- SSH-only server access

---

[Unreleased]: https://github.com/v0idjs/VPS-Studio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/v0idjs/VPS-Studio/releases/tag/v0.1.0
