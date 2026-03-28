# AI Agent Instructions

Welcome, AI Agent. This repository contains **PasswordManager**, an Electron + React application written in TypeScript. 

When modifying or analyzing code in this repository, you **MUST** adhere to the guidelines and context provided in the folders below. They dictate the project's architecture, styling, testing approach, and technology stack nuances.

## Directory Structure for Agent Context

- [Architecture Rules](./agents/architecture.md): Guidelines on Electron processes (Main vs. Renderer), IPC communication, and directory structure.
- [Coding Style](./agents/coding-style.md): Prettier, ESLint conventions, and general TypeScript/React component rules.
- [Testing](./agents/testing.md): Guidelines for writing tests using Jest and React Testing Library.

### Tech Stack Deep Dives

- [React & State Management](./stack/react.md): React 18, Functional Components, Hooks, Redux Toolkit, and Material-UI (MUI).
- [TypeScript](./stack/typescript.md): Strict mode conventions, Interfaces vs. Types, and avoiding `any`.
- [Electron](./stack/electron.md): Main process responsibilities, secure IPC via `contextBridge`, and security best practices.


---
**Core Rule**: Always read the relevant `.md` files in `agents/` and `stack/` before suggesting architectural changes, creating new components, or modifying the IPC layer.
