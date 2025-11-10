# 🛡️ front-guard

![CI](https://github.com/<your-github-username>/front-guard/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Build](https://img.shields.io/github/actions/workflow/status/<your-github-username>/front-guard/ci.yml?branch=main)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

> **Guardrails for safe, reliable, and maintainable frontend engineering.**

---

## ✨ Overview

`front-guard` standardises the critical low-level utilities every frontend team rewrites:  
HTTP clients, storage, async handling, error models, feature flags, and security helpers —  
with idiomatic React bindings out of the box.

It’s framework-agnostic, fully typed, SSR-safe, and production-ready.

---

## 💬 Why this project?

front-guard was created to give frontend engineers a safe, opinionated, and production-ready baseline for building resilient applications.
It aims to remove the recurring friction around HTTP, storage, async handling, and error boundaries —
so teams can focus on delivering product features, not boilerplate.

## 📦 Packages

| Package                                | Description                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------- |
| [`@front-guard/core`](packages/core)   | Framework-agnostic core guardrails (HTTP, storage, async, flags, security). |
| [`@front-guard/react`](packages/react) | React bindings and async utilities built on the core.                       |

---

## 🚀 Quick Start

### 1. Install

```bash
pnpm add @front-guard/core
pnpm add @front-guard/react react
```

## Run locally

```bash
pnpm install
pnpm build
pnpm test
```

## Local Example

```bash
pnpm --filter front-guard-example-react-vite dev
```

Then open http://localhost:5173

## Architecture

```mermaid
flowchart LR
  subgraph Core["@front-guard/core"]
    direction TB
    HTTP[HTTP Client\n(createClient)]
    STORE[Storage\n(createStore)]
    ASYNC[Async Helpers\n(createAsyncState)]
    FLAGS[Feature Flags\n(createFlagsClient)]
    SECURITY[Security\n(escapeHtml, sanitizeHtml, safeUrl)]
    ERRORS[Errors\n(AppError, createError)]
  end

  subgraph React["@front-guard/react"]
    direction TB
    useAsyncOp[useAsyncOp]
    useRequest[useRequest]
    AsyncBoundary[AsyncBoundary]
  end

  subgraph App["Consumer Apps"]
    direction TB
    ReactApp[React/Vite/Next.js App]
    OtherFrameworks[Other Frontends\n(via core only)]
  end

  HTTP --> ERRORS
  STORE --> ERRORS
  FLAGS --> STORE
  ASYNC --> ERRORS

  useAsyncOp --> ASYNC
  useRequest --> useAsyncOp
  useRequest --> HTTP
  AsyncBoundary --> ASYNC

  ReactApp --> React
  ReactApp --> Core
  OtherFrameworks --> Core
```

## 🧪 Testing & Quality

Unit Tests: Vitest (node env for core, jsdom env for React)

Hooks Testing: @testing-library/react

CI Pipeline: GitHub Actions – build · lint · test · typecheck

Linting: ESLint + Prettier

Build: tsup (ESM + CJS + types)

## 🔒 Security Notice

sanitizeHtml is intentionally conservative.
For rich text, integrate a dedicated sanitizer like DOMPurify
.

safeUrl allows only http: and https: schemes.

Never perform GET-based logout; always use POST with CSRF protection.
