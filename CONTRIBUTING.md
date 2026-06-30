# Contributing to VPS Studio

Thank you for your interest in contributing to VPS Studio! This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (v1.70 or higher)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)
- [Git](https://git-scm.com/)

### Development Setup

1. **Fork the repository**
   
   Click the "Fork" button on the GitHub repository page.

2. **Clone your fork**
   
   ```bash
   git clone https://github.com/YOUR_USERNAME/vps-studio.git
   cd vps-studio
   ```

3. **Add upstream remote**
   
   ```bash
   git remote add upstream https://github.com/original-owner/vps-studio.git
   ```

4. **Install dependencies**
   
   ```bash
   npm install
   ```

5. **Start development**
   
   ```bash
   npm run tauri dev
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title**: Use a descriptive title
- **Steps to reproduce**: List steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node.js version, Rust version
- **Screenshots**: If applicable, add screenshots

### Suggesting Features

Feature suggestions are welcome! When suggesting a feature:

- **Use case**: Explain why this feature would be useful
- **Description**: Clear description of the feature
- **Alternatives**: Any alternative solutions you've considered
- **Additional context**: Mockups, examples, or references

### Contributing Code

1. **Find an issue**: Look for issues labeled `good first issue` or `help wanted`

2. **Create a branch**: Create a feature branch from `main`
   
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**: Implement your changes following the coding standards

4. **Test your changes**: Ensure everything works as expected

5. **Commit**: Use conventional commit format
   
   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push**: Push to your fork
   
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create PR**: Open a Pull Request on GitHub

## Coding Standards

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use Zustand for state management

### Backend (Rust)

- Follow Rust best practices and idioms
- Use `rustfmt` for formatting
- Use `clippy` for linting
- Write documentation for public APIs
- Handle errors properly

### General

- Write clear, readable code
- Add comments when necessary
- Follow existing code style
- Keep functions small and focused
- Use meaningful variable names

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```
feat(terminal): add keyboard shortcuts for tab management
fix(auth): resolve SSH connection timeout issue
docs(readme): update installation instructions
refactor(files): simplify file explorer component
```

## Pull Request Process

1. **Update documentation**: Update README or relevant docs if needed

2. **Add tests**: Add tests for new features or bug fixes

3. **Ensure CI passes**: All checks must pass before merge

4. **Request review**: Request review from maintainers

5. **Address feedback**: Make changes based on review feedback

6. **Merge**: Once approved, your PR will be merged

### PR Title

Use the same commit convention format for PR titles:

```
feat: add new feature
fix: resolve bug
docs: update documentation
```

### PR Description

Include in your PR description:

- What this PR does
- Why this change is needed
- How to test it
- Related issues (use `Closes #123` or `Fixes #123`)

## Reporting Bugs

1. Check existing issues first
2. Use the bug report template
3. Provide reproduction steps
4. Include environment details
5. Add screenshots if applicable

## Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Explain the use case
4. Provide alternatives considered

## Questions?

If you have questions, feel free to:

- Open a discussion on GitHub
- Ask in an existing issue
- Reach out to maintainers

Thank you for contributing to VPS Studio!
