# Password Manager

A secure, offline-first Desktop Application for password and credential management, built with modern web and desktop technologies.

## 🛠 Technology Stack

- **Framework**: [Electron](https://www.electronjs.org/) (Desktop runtime)
- **UI library**: [React 18](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & `react-redux`
- **Styling & UI**: [Material-UI (MUI)](https://mui.com/) & [Emotion](https://emotion.sh/)
- **Build Tool**: [Webpack](https://webpack.js.org/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19.0 recommended via Volta)
- `npm` (usually bundled with Node.js)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/MatsudaYoshio/password-manager.git
cd password-manager
npm install
```

### Development

To start the local development server (with HMR & live reloading for both Electron and React using Webpack):

```bash
npm run dev
```

#### Formatting & Linting

Before pushing changes, ensure the codebase is properly formatted and linted:

```bash
# Formats and fixes lint errors
npm run lint-and-format
```

#### Git Hooks (Husky)

This project uses [Husky](https://typicode.github.io/husky/) and `lint-staged` to enforce code quality before commits.
When you run `npm install`, the Husky hooks are automatically set up (`npm run prepare`).

On every `git commit`, Husky will trigger a pre-commit hook that runs Prettier and ESLint on your staged files, ensuring formatting and linting rules are met. If linting fails, the commit will be aborted.

#### CI/CD (GitHub Actions)

This repository utilizes GitHub Actions to automate workflows. Upon pushing or opening a Pull Request, our CI pipeline automatically runs formatting checks, linting, and unit tests (using `npm run test:ci`). This ensures continuous quality and prevents regressions before they are merged.

## 🧪 Testing

We use Jest for unit and integration testing. Tests are colocated within `__tests__` directories next to the source files.

- **Run all tests**:
  ```bash
  npm run test
  ```
- **Run tests in watch mode** (useful for development):
  ```bash
  npm run test:watch
  ```
- **Run tests with coverage**:
  ```bash
  npm run test:coverage
  ```

For detailed instructions on creating and reviewing tests (including Mocking strategies and React Testing Library conventions), please consult our [Testing Guidelines](agents/testing.md).

## 🏗 Build & Release

To compile the application for production and package it into an executable installer:

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
2. **Package without installer** (Output to `release/`):
   ```bash
   npm run package
   ```
3. **Full Release** (Builds the NSIS installer via electron-builder):
   ```bash
   npm run release
   ```

For comprehensive release lifecycle documentation, refer to the [Release Guide](docs/release-guide.md).