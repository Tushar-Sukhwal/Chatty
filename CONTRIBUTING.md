# Contributing to Chatty

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **Chatty**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Commit Message Guidelines](#commit-message-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Style Guide](#style-guide)
7. [License](#license)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **security@chatty.dev**.

## Getting Started

### Prerequisites

* Node.js \>= 18.x
* pnpm or npm (v9+) or yarn (v1)
* Bun (optional, used for lightning-fast local development)
* Docker (optional, for running dependencies like Kafka & Redis)

### Setup

```bash
# clone the repo
$ git clone https://github.com/your-username/chatty.git
$ cd chatty-final

# install client deps
$ cd client && pnpm install

# install server deps
$ cd ../server && pnpm install

# copy example env vars
$ cp .env.example .env

# start dev servers
$ pnpm dev        # or use bunx dev
```

> **Tip**: The repo uses **prettier**, **eslint**, and **husky** to enforce code quality. Make sure hooks run successfully before pushing.

## How to Contribute

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feat/my-awesome-feature`.
3. **Commit** your changes: `git commit -m "feat: add awesome feature"`.
4. **Push** to the branch: `git push origin feat/my-awesome-feature`.
5. **Open** a Pull Request.

### Good First Issues

You can find issues labeled **good first issue** or **help wanted** to start with.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**: build • chore • ci • docs • feat • fix • perf • refactor • revert • style • test

Example:

```
feat(chat): add typing indicator to UI
```

## Pull Request Process

* Ensure your PR focuses on a single concern.
* Include tests for new functionality.
* Update documentation as needed.
* Link any relevant issues in the description.
* Check the PR checklist automatically added to your PR description (see `.github/pull_request_template.md`).

## Style Guide

* Use **ESLint** configured rules.
* Use **Prettier** for formatting (configured via `.prettierrc`).
* Write descriptive variable and function names.
* Keep functions small and focused.
* Prefer composition over inheritance.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE). 