# Coding Style Guide

This document outlines the coding style and best practices to be followed in this repository. A consistent coding style is crucial for maintaining code quality, readability, and ease of collaboration.

This guide is enforced using Prettier and ESLint. Please ensure your editor is configured to use these tools.

## Formatting (Prettier)

We use [Prettier](https://prettier.io/) for automatic code formatting. This ensures a consistent style across the entire codebase without the need for manual adjustments.

The Prettier configuration is defined in the `.prettierrc.json` file. Please refer to it for the complete set of rules.

### Key Formatting Rules:

- **Single Quotes**: Use single quotes for strings (`'hello'`) instead of double quotes.
- **Semicolons**: Semicolons are required at the end of statements.
- **Trailing Commas**: No trailing commas in objects or arrays.
- **Print Width**: Lines should not exceed 100 characters.
- **Tab Width**: Use 2 spaces for indentation.

## Linting (ESLint)

We use [ESLint](https://eslint.org/) to identify and report on patterns found in ECMAScript/JavaScript code. It helps in maintaining code quality and catching potential errors early.

The ESLint configuration is defined in the `eslint.config.js` file.

### Key Linting Rules:

- **No Unused Variables**: Unused variables are flagged as warnings. If a variable is intentionally unused, prefix it with an underscore (e.g., `_unusedVar`).
- **No Explicit `any`**: The use of `any` is discouraged and will trigger a warning. Use specific types whenever possible.
- **React Hooks**: The rules of hooks are enforced to prevent common mistakes.
- **React in JSX Scope**: It is not necessary to import `React` in every file that uses JSX.

## React Best Practices

- **Functional Components**: Use functional components with hooks instead of class-based components.
- **Component Naming**: Use PascalCase for component filenames and component names (e.g., `MyComponent.tsx`).
- **Props**: Use interfaces for defining component props.
- **State Management**: For complex state management, use Redux Toolkit. For simpler cases, `useState` and `useReducer` are sufficient.
- **File Structure**: Group related files together. For example, a component's styles and tests should be in the same directory as the component itself.

## TypeScript Best Practices

- **Type Everything**: Avoid using `any`. Provide types for all variables, function parameters, and return values.
- **Interfaces vs. Types**: Prefer `interface` for defining object shapes and `type` for other types (unions, intersections, etc.).
- **Non-null Assertion**: Avoid using the non-null assertion operator (`!`). Instead, use type guards or check for null values.
- **Utility Types**: Leverage built-in utility types like `Partial`, `Pick`, and `Omit` to create new types from existing ones.

## Electron Best Practices

- **Main and Renderer Processes**: Understand the difference between the main and renderer processes. Keep the main process as lightweight as possible.
- **IPC (Inter-Process Communication)**: Use `contextBridge` to expose APIs from the main process to the renderer process in a secure way. Avoid using `remote` module.
- **Security**: Be mindful of security best practices. Do not enable `nodeIntegration` in renderer windows that load remote content.
- **Packaging**: Use tools like `electron-builder` or `electron-forge` to package and distribute your application.
