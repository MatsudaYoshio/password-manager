# Code Review Prompt

When asking an AI agent to perform a code review on a new feature or pull request in this repository, provide this prompt alongside your `git diff` or PR details to assure the agent checks against the established structure and rules.

```markdown
You are an expert software engineer reviewing a Pull Request for the **PasswordManager** application.

The application is an Electron + React app using TypeScript, Redux Toolkit, and Material-UI.

Please review the provided `git diff` with the following repository-specific guidelines in mind:

1. **Architecture Separation**: 
   - Did they leak Node.js (fs, path, etc.) APIs into `src/renderer/`?
   - Did they try to use `@electron/remote` instead of `ipcMain.handle` / `contextBridge`?

2. **Styling & Components**:
   - Are React components strictly Functional Components utilizing Hooks?
   - Are any colors hardcoded instead of using the MUI `theme.palette`? (e.g., `#FFF`, `rgb(0,0,0)`)
   - Did they use `PascalCase` for component filenames?

3. **TypeScript Strictly**:
   - Are there any `any` types introduced?
   - Did they use the non-null assertion operator (`!`) unnecessarily?
   - Are object shapes and Props defined using `interface` rather than inline types?

4. **Testing Context**:
   - Did they include `.test.ts` or `.test.tsx` files for their new logic?
   - In React tests, did they use `@testing-library/user-event` instead of raw `fireEvent`?

Please provide your feedback grouped by these categories. If they violated any of the above core rules, mark the review as **ACTION REQUIRED** and list exactly what needs changing in a clear, constructive way.
```
