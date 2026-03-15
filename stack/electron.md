# Electron Conventions & Security

Writing secure desktop implementations requires treating the renderer process as untrusted.

## Process Segregation

1. **Main Process (`src/electron/`)**: 
   - Has full Node.js access.
   - Manages OS native elements (Windows, Menus, Dialogs).
   - Operates database or file-system level tasks (e.g., reading JSON/SQLite, saving files).
   - Responsible for launching the `BrowserWindow`.

2. **Renderer Process (`src/renderer/`)**: 
   - Runs purely in Chromium. 
   - Has NO Node.js access. Wait, `nodeIntegration: false` is critical.
   - **Never** expose raw `fs`, `path`, or `child_process` directly to the renderer.

## IPC (Inter-Process Communication)

To communicate between the two, we use Preload scripts.

### Defining an API
When creating a new piece of logic:
1. Define the handler in the Main process using `ipcMain.handle()`.
   ```ts
   // In main/ipcHandlers.ts
   ipcMain.handle('get-secure-data', async (event, args) => {
       return await performSecureTask(args);
   });
   ```
2. Expose it in Preload using `contextBridge`.
   ```ts
   // In preload.ts
   contextBridge.exposeInMainWorld('electronAPI', {
       getSecureData: (args) => ipcRenderer.invoke('get-secure-data', args)
   });
   ```
3. Add it to the global types (usually in `src/shared/types/`).
   ```ts
   export interface IElectronAPI {
       getSecureData: (args: any) => Promise<any>;
   }
   declare global {
       interface Window {
           electronAPI: IElectronAPI;
       }
   }
   ```

### No Remote Module
The `@electron/remote` module is highly insecure and poorly performant. It is explicitly banned in this repo.

## Window Configurations

When initializing `BrowserWindow`, abide by these defaults:
```ts
const mainWindow = new BrowserWindow({
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,       // Must be true
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        sandbox: true                 // Highly recommended enabled
    }
});
```

## Data Persistence & Encryption

As a Password Manager, securely storing data is a top priority.
- **Credential Storage**: Raw password lists must NEVER be saved in plain text. Always encrypt the data buffer using Electron's `safeStorage.encryptString(JSON.stringify(data))` before writing securely into the file system (e.g. `credentials.bin`).
- **Application Preferences**: Non-sensitive settings (like Window sizes or Sidebar open-state) can be stored using `electron-store`. Never use `electron-store` for actual credentials.
