# Development Guide

This guide covers development setup, workflow, and best practices for contributing to VPS Studio.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://www.rust-lang.org/tools/install) v1.70+
- [Git](https://git-scm.com/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/v0idjs/VPS-Studio.git
cd vps-studio

# Install dependencies
npm install

# Start development
npm run tauri dev
```

## Development Environment

### IDE Setup

#### VS Code (Recommended)

Install these extensions:
- **rust-analyzer**: Rust language support
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind support
- **Tauri**: Tauri development support

#### Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "rust-analyzer.checkOnSave.command": "clippy",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Environment Setup

1. **Node.js**: Use nvm or nvm-windows for version management
2. **Rust**: Use rustup for Rust installation
3. **Git**: Configure Git with your identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Development Workflow

### Branch Strategy

We use a simplified Git flow:

- `main`: Stable, production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `docs/*`: Documentation changes

### Creating a Feature Branch

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature
```

### Making Changes

1. **Make small, focused commits**
2. **Write clear commit messages**
3. **Keep PRs small and reviewable**
4. **Update documentation if needed**

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code structure
test: add tests
chore: maintenance tasks
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

2. **Run checks**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

4. **Fill out PR template**
   - Description of changes
   - Related issues
   - Testing steps
   - Screenshots (if applicable)

## Code Style

### TypeScript/React

- Use TypeScript for all new code
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names

```typescript
// Good
interface ServerCardProps {
  server: Server;
  onSelect: (id: string) => void;
}

export function ServerCard({ server, onSelect }: ServerCardProps) {
  return (
    <div onClick={() => onSelect(server.id)}>
      {server.name}
    </div>
  );
}

// Bad
function ServerCard(props) {
  return <div onClick={() => props.onSelect(props.server.id)}>{props.server.name}</div>;
}
```

### Rust

- Follow Rust conventions
- Use `rustfmt` for formatting
- Use `clippy` for linting
- Write documentation for public APIs

```rust
/// Adds a new server to the database.
///
/// # Arguments
///
/// * `state` - Application state
/// * `input` - Server creation input
///
/// # Returns
///
/// The ID of the created server.
#[tauri::command]
pub async fn add_server(
    state: State<'_, AppState>,
    input: AddServerInput,
) -> Result<String, String> {
    // Implementation
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow the design system
- Keep styles consistent

```tsx
// Good
<div className="flex items-center p-4 bg-surface rounded-lg">

// Bad
<div style={{ display: 'flex', padding: '16px', backgroundColor: '#1e1e1e' }}>
```

## Testing

### Frontend Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Backend Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run tests with output
cargo test -- --nocapture
```

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── components/    # Component tests
│   └── utils/         # Utility tests
├── integration/       # Integration tests
│   └── ipc/           # IPC tests
└── e2e/              # End-to-end tests
    └── workflows/     # User workflow tests
```

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ServerCard } from './ServerCard';

describe('ServerCard', () => {
  it('renders server name', () => {
    const server = { id: '1', name: 'My Server' };
    render(<ServerCard server={server} onSelect={() => {}} />);
    expect(screen.getByText('My Server')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    const server = { id: '1', name: 'My Server' };
    render(<ServerCard server={server} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('My Server'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

## Debugging

### Frontend Debugging

1. **React DevTools**: Inspect component tree
2. **Console**: Check for errors
3. **Network**: Monitor IPC calls

### Backend Debugging

1. **Rust Analyzer**: IDE support
2. **println!**: Debug output
3. **Debugger**: GDB/LLDB integration

### Common Issues

#### Build Errors

```bash
# Clear cache
rm -rf node_modules
rm -rf src-tauri/target
npm install
npm run tauri build
```

#### TypeScript Errors

```bash
# Check types
npm run typecheck

# Fix auto-fixable issues
npm run lint --fix
```

#### Rust Errors

```bash
# Check for issues
cargo clippy

# Format code
cargo fmt
```

## Common Tasks

### Adding a New Feature

1. Create feature branch
2. Add types in `lib/*-types.ts`
3. Add IPC functions in `hooks/use-ipc.ts`
4. Add backend commands in `src-tauri/src/commands/`
5. Add frontend components
6. Update documentation
7. Create PR

### Adding a New IPC Command

1. **Define types** in `lib/types.ts`
2. **Add Rust command** in `src-tauri/src/commands/`
3. **Register command** in `src-tauri/src/main.rs`
4. **Add IPC wrapper** in `hooks/use-ipc.ts`
5. **Use in components**

### Updating Database Schema

1. **Create migration** in `src-tauri/src/db/migrations/`
2. **Update queries** in `src-tauri/src/db/queries/`
3. **Update types** in `lib/types.ts`
4. **Test migration**

### Adding UI Components

1. **Check existing** components in `src/components/ui/`
2. **Create component** following patterns
3. **Add documentation** if needed
4. **Export from index** if shared

## Performance

### Profiling

```bash
# Frontend performance
npm run build -- --profile

# Backend performance
cargo build --release
perf record -g ./target/release/vps-studio
```

### Optimization Tips

- Use React.memo for expensive components
- Debounce IPC calls
- Lazy load components
- Cache frequently used data
- Use virtual scrolling for large lists

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
