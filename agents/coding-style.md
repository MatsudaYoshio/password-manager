# Coding Style Guidelines

This repository enforces a unified coding style through automated tools. Always adhere to these standards when creating or modifying code.

## File Naming

- **React Components**: PascalCase (e.g., `Button.tsx`, `TreeView.tsx`).
- **Hooks, Utils, Slices**: camelCase (e.g., `useDrag.ts`, `item-slice.ts`, `auth.ts`).
- **CSS Modules/Files**: match the associated component name (e.g., `App.css`).

## Automated Formatting & Linting

We utilize Prettier and ESLint. 

### Prettier
- Read the `.prettierrc.json` file for specific configuration.
- To run Prettier: `npm run format`.
- Always verify your generated code passes Prettier conventions before committing.

### ESLint
- Read `eslint.config.js` for rules.
- To test: `npm run lint` or `npm run lint:fix`.

## React Specifics

- Use **Functional Components** exclusively. Class components are not allowed.
- Export components as `export const ComponentName = () => { ... }` or `export default function ComponentName() { ... }` consistently.
- Avoid large inline monolithic styles; prefer `styled-components` / `emotion` or the established Material-UI `sx` prop mechanism if using MUI.

## Hardcoded Values

- **Colors**: Never hardcode colors (e.g., `#FF0000`). Always extract colors from the MUI `useTheme` object (e.g., `theme.palette.primary.main`) to support dynamic theming.
- **Strings**: Centralize major strings or at least avoid duplicated magic strings.

Always review `../docs/style-guide.md` for a complete reference.
