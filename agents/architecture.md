# Architecture & Processes

This repository uses [Electron](https://www.electronjs.org/) and is structured specifically to delineate main process and renderer process responsibilities securely.

## Directory Layout

- `src/main/` or `src/electron/`: Contains the Electron main process code (Node.js environment).
  - Handles window creation, lifecycle events, Native OS integrations, and file system access.
- `src/renderer/`: Contains the React UI code (Browser environment).
  - **Cannot** access Node.js APIs directly (e.g., no `fs`, no `path`). Must rely on IPC.
- `src/shared/`: Defines types, constants, and utilities that are shared between main and renderer processes.

## Inter-Process Communication (IPC)

Because `nodeIntegration` is disabled for security reasons, the renderer process communicates with the main process via an established IPC bridge.

### Context Bridge
We use `contextBridge` to expose specific, safe APIs to the renderer.
- **Preload Script**: Defined in `src/electron/preload.ts` (or similar). This script runs before the renderer loads.
- **API Shape**: Usually exposed via `#window.electronAPI#` or similar typed global object. 

### Avoid `remote`
**Do not use the `remote` module.** It is deprecated and inherently unsecure. Always configure `ipcMain.handle` (Main) and `ipcRenderer.invoke` (via Preload script to Renderer).

## State Management

The application utilizes a global state architecture within the renderer:
- **Redux Toolkit**: Used for complex state logic, such as the password items tree, global UI toggles, and authentication states.
- **Slices**: Found in `src/renderer/store/`. Add new features by creating specific slices.

## Adding Features

1. **Renderer-Only Feature**: Implement the React component in `src/renderer/components/`. If global state is needed, add to Redux slice.
2. **Main-Process Dependent Feature**: 
    - Define type signatures in `src/shared/`.
    - Implement the handler in `src/electron/ipcHandlers.ts` using `ipcMain.handle`.
    - Expose the method safely in `src/electron/preload.ts` using `contextBridge`.
    - Call the global method from your React component.

Always ensure strict isolation of these spheres when modifying code.
