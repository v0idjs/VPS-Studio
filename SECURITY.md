# Security Policy

## Reporting a Vulnerability

The VPS Studio team takes security seriously. We appreciate your efforts to responsibly disclose any security vulnerabilities you find.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Supported Versions

We provide security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

### Security Update Policy

- Security updates will be released as soon as possible after a vulnerability is confirmed
- Critical vulnerabilities will be patched within 7 days
- High severity vulnerabilities will be patched within 14 days
- Medium and low severity vulnerabilities will be patched in the next release

## Security Considerations

### Local-First Architecture

VPS Studio is designed as a local-first application:

- All data is stored locally on your machine
- No cloud services or external data transmission
- No account system or cloud synchronization
- SSH connections are direct, not proxied through third parties

### Data Encryption

- Sensitive data (passwords, SSH keys) is encrypted at rest using AES-256-GCM
- Encryption keys are stored in your OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- Encryption keys never leave your machine

### SSH Security

- All SSH connections use the `ssh2` crate for secure communication
- No SSH agent forwarding
- Key-based authentication is strongly recommended over password authentication
- Connection credentials are encrypted in the database

### Database Security

- SQLite database is stored locally
- Sensitive fields are encrypted before storage
- Database file permissions should be restricted to the user

### Best Practices for Users

1. **Use SSH keys**: Prefer SSH key authentication over passwords
2. **Keep updated**: Always use the latest version
3. **Restrict access**: Ensure only authorized users can access the application data
4. **Review servers**: Regularly review which servers are configured in the application
5. **Backup regularly**: Use the built-in backup feature to create regular backups

## Security Features

### Implemented

- AES-256-GCM encryption for sensitive data
- OS keychain integration for key storage (no hardcoded fallback keys)
- Local-only data storage
- SSH key authentication support
- No external network dependencies
- Content Security Policy (CSP) enabled in Tauri config (no `unsafe-inline`)
- Input validation with strict allowlists for ALL user inputs (service names, container IDs, IPs, ports, SSH key types, kill signals, package names, cron schedules, cron commands, settings keys, log levels)
- Path traversal protection via filename sanitization
- Command success detection using SSH exit codes
- SQLite database file permissions set to 0600 on Unix
- Server credentials (password, private_key, passphrase) encrypted at rest with AES-256-GCM
- SSH key import uses safe `printf` instead of `echo` (prevents shell injection)
- Cron job inputs validated (schedule and command patterns)
- Settings import validates base64 format and SQL dump safety
- DB row errors logged to stderr instead of silently dropped
- Zeroize decrypted credentials from memory after use (`zeroize` crate)
- SSH host key verification via `known_hosts` (TOFU model) — prevents MITM attacks
- Shared `AlertDialog` component replacing native browser `confirm()` for destructive actions
- Shared `EmptyState` component with actionable guidance for all empty list views

### Planned

- Rate limiting for connection attempts
- Tar extraction sandboxing (S3)
- SSH authentication flow improvements (S6/S7/S8)
- Upgrade ssh2/libssh2-sys to address CVE-2026-55200 and Terrapin Attack

## Disclosure Policy

When we receive a security report, we will:

1. Confirm the vulnerability and determine its impact
2. Identify affected versions
3. Develop and test a fix
4. Release the fix as soon as possible
5. Publish a security advisory

## Credits

We would like to thank security researchers who responsibly disclose vulnerabilities to us.
