# React & State Management

This file provides specific conventions for React and State Management in the current codebase.

## Core React Guidelines

- **Version**: We utilize React 18.
- **Component Style**: Only use functional components with Hooks.
- **Props**: Define props using TypeScript `interface`s above the component definition. Avoid inline types.
- **File Structure**: Each component should generally reside in its own `.tsx` file loosely mirroring the `src/renderer/components/...` directory structure.

## State Management

We use **Redux Toolkit (RTK)** for complex global state, combined with `react-redux`.

### Redux Slices (RTK)
- Located in `src/renderer/store/`.
- Prefer defining atomic slices for specific feature domains (e.g., `item-slice.ts`, `auth-slice.ts`).
- **Immutability**: RTK uses Immer under the hood. You can mutate state safely within reducers, but avoid returning new state objects unless necessary.

### Local State
- For localized component state (toggling a simple dropdown, managing a simple input form), prefer `useState` or `useReducer`.

### Context API
- Use the Context API sparingly. If it starts to manage frequently changing complex data across many components, refactor it into Redux.

## UI Framework (Material-UI)

We extensively use **Material-UI (MUI)**.
- **Imports**: Import components directly from `@mui/material` (e.g., `import Box from '@mui/material/Box'`).
- **Styling**: Prefer the `sx` prop for simple styling needs. 
- **Theming**: Do not use hardcoded hex variables. Always use `theme.palette.*` to ensure dark mode support natively.
- **Icons**: Utilize `@mui/icons-material`.
- **Advanced Components**: 
  - For Trees, we utilize `@mui/x-tree-view`.
  - For generic layouts, utilize `Grid` or `Stack`.
  - For resizable layouts (e.g., sidebars), we utilize `react-resizable-panels`.
