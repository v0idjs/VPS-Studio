# Architecture Overview

This document describes the architecture and design of VPS Studio.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Project Structure](#project-structure)

## High-Level Architecture

VPS Studio follows a local-first, client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     VPS Studio Desktop                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Frontend (React)                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │   │
│  │  │Dashboard│  │Terminal │  │  Files  │  │  ...  │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └───────┘ │   │
│  │                    │                                │   │
│  │              ┌─────┴─────┐                          │   │
│  │              │   State   │                          │   │
│  │              │  (Zustand)│                          │   │
│  │              └─────┬─────┘                          │   │
│  └────────────────────┼────────────────────────────────┘   │
│                       │ IPC (Tauri)                         │
│  ┌────────────────────┼────────────────────────────────┐   │
│  │                  Backend (Rust)                      │   │
│  │              ┌─────┴─────┐                          │   │
│  │              │  Tauri    │                          │   │
│  │              │  Commands │                          │   │
│  │              └─────┬─────┘                          │   │
│  │    ┌───────────────┼───────────────┐                │   │
│  │    │               │               │                │   │
│  │  ┌─┴──┐  ┌────────┴────────┐  ┌───┴───┐           │   │
│  │  │ DB │  │       SSH       │  │  ...  │           │   │
│  │  │(SQLite)│  │   (ssh2)     │  │       │           │   │
│  │  └────┘  └─────────────────┘  └───────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SSH
                           ▼
                    ┌──────────────┐
                    │Remote Servers│
                    │   (Linux)    │
                    └──────────────┘
```

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.3.x |
| **TypeScript** | Type safety | 5.4.x |
| **Tailwind CSS** | Styling | 3.4.x |
| **Zustand** | State management | 4.5.x |
| **Recharts** | Charts | 2.12.x |
| **xterm.js** | Terminal | 6.0.x |
| **Lucide React** | Icons | 1.22.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Rust** | Programming language | 2021 Edition |
| **Tauri** | Desktop framework | 2.x |
| **rusqlite** | SQLite driver | 0.31.x |
| **ssh2** | SSH client | 0.9.x |
| **aes-gcm** | Encryption | 0.10.x |
| **keyring** | OS keychain | 2.x |
| **tokio** | Async runtime | 1.x |
| **serde** | Serialization | 1.x |

### Storage

| Technology | Purpose |
|------------|---------|
| **SQLite** | Local database |
| **AES-256-GCM** | Encryption at rest |
| **OS Keychain** | Key management |

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/              # Base UI components (Button, Input, Card)
│   ├── layout/          # Layout components (Sidebar, TopBar)
│   ├── common/          # Shared components (ErrorBoundary, LoadingSpinner)
│   └── [feature]/       # Feature-specific components
├── stores/              # Zustand stores
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and types
└── styles/              # Global styles
```

### State Management

VPS Studio uses Zustand for state management:

```typescript
// stores/app-store.ts
interface AppState {
  selectedServerId: string | null;
  servers: Server[];
  selectServer: (id: string | null) => void;
  // ... more state and actions
}
```

### IPC Communication

Frontend communicates with backend through Tauri IPC:

```typescript
// hooks/use-ipc.ts
export const useIpc = () => {
  const invoke = useTauriInvoke();
  
  const listServers = () => invoke('list_servers');
  const addServer = (input: AddServerInput) => invoke('add_server', { input });
  // ... more IPC functions
};
```

## Backend Architecture

### Module Structure

```
src-tauri/src/
├── main.rs              # Application entry point
├── lib.rs               # Library exports
├── db/                  # Database layer
│   ├── mod.rs           # Initialization
│   ├── schema.rs        # Table definitions
│   ├── migrations.rs    # Migration runner
│   ├── crypto.rs        # Encryption/decryption
│   ├── keychain.rs      # Keychain integration
│   └── queries/         # SQL queries
├── ssh/                 # SSH operations
│   ├── mod.rs           # Module exports
│   ├── connection.rs    # SSH session management
│   ├── sftp.rs          # SFTP operations
│   └── [module].rs      # Feature-specific SSH operations
├── commands/            # Tauri command handlers
│   ├── mod.rs           # Module exports
│   ├── servers.rs       # Server CRUD
│   ├── dashboard.rs     # Dashboard data
│   └── [module].rs      # Feature-specific commands
└── notifications/       # Desktop notifications
    ├── mod.rs           # Module exports
    ├── engine.rs        # Notification engine
    └── commands.rs      # Notification commands
```

### Command Pattern

All Tauri commands follow this pattern:

```rust
#[tauri::command]
pub async fn command_name(
    state: State<'_, AppState>,
    param: String,
) -> Result<ResponseType, String> {
    // 1. Validate input
    // 2. Perform operation
    // 3. Return result
}
```

### Database Layer

SQLite operations use raw SQL with rusqlite:

```rust
pub fn list_servers(conn: &Connection) -> Result<Vec<Server>> {
    let mut stmt = conn.prepare("SELECT * FROM servers")?;
    let servers = stmt.query_map([], |row| {
        Ok(Server {
            id: row.get(0)?,
            name: row.get(1)?,
            // ...
        })
    })?;
    // ...
}
```

## Data Flow

### 1. User Action

```
User clicks button → React component calls IPC function
```

### 2. IPC Communication

```
IPC function → Tauri invoke → Rust command handler
```

### 3. Backend Processing

```
Command handler → Database query / SSH operation → Return result
```

### 4. State Update

```
Result returned → Zustand store updated → UI re-rendered
```

### Example: Adding a Server

```
1. User fills form and clicks "Add"
2. AddServerDialog calls addServer(input)
3. Tauri invokes commands::servers::add_server
4. Rust encrypts password and inserts into SQLite
5. Server list is refreshed
6. UI updates to show new server
```

## Security Architecture

### Encryption at Rest

```
Plaintext → AES-256-GCM encrypt → Ciphertext → SQLite
```

### Key Management

```
Encryption Key → OS Keychain → Secure Storage
```

### SSH Connections

```
Credentials → ssh2 library → Encrypted SSH tunnel → Remote server
```

### Security Boundaries

1. **Frontend**: No direct access to sensitive data
2. **IPC**: Data serialized/deserialized safely
3. **Backend**: Encryption/decryption at rest
4. **Database**: Encrypted sensitive fields
5. **SSH**: Encrypted in transit

## Project Structure

### Directories

| Directory | Purpose |
|-----------|---------|
| `src/` | React frontend code |
| `src-tauri/` | Rust backend code |
| `docs/` | Documentation |
| `tests/` | Test files |
| `specs/` | Specification documents |
| `.github/` | GitHub configuration |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `Cargo.toml` | Rust dependencies |
| `tauri.conf.json` | Tauri configuration |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

## Performance Considerations

### Frontend

- **Code splitting**: Lazy load components
- **Memoization**: Use React.memo and useMemo
- **Virtual scrolling**: For large lists
- **Debounced inputs**: Reduce IPC calls

### Backend

- **Connection pooling**: Reuse SSH connections
- **Query caching**: Cache frequent queries
- **Async operations**: Non-blocking I/O
- **Memory management**: Efficient data structures

## Scalability

### Current Limitations

- Single-user application
- Local-only storage
- Direct SSH connections (no proxying)

### Future Improvements

- Connection pooling for multiple servers
- Background task processing
- Plugin system for extensions
- Cloud sync (optional)

## Testing Strategy

### Frontend Testing

- **Unit tests**: Component logic
- **Integration tests**: Component interactions
- **E2E tests**: Full user workflows

### Backend Testing

- **Unit tests**: Function logic
- **Integration tests**: Database operations
- **Security tests**: Encryption/decryption

## Documentation

### Types of Documentation

1. **User Documentation**: Guides and tutorials
2. **Developer Documentation**: Architecture and API
3. **API Documentation**: Command references
4. **Security Documentation**: Security policies

### Documentation Tools

- **Markdown**: All documentation
- **GitHub Pages**: Hosted documentation
- **In-app Help**: Tooltips and guides
