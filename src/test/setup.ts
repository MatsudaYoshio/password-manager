import '@testing-library/jest-dom';

// Electronのモック（プロジェクトの実際のAPIに合わせて）
Object.defineProperty(window, 'api', {
  value: {
    // TreeNode関連のAPI
    readNodes: jest.fn().mockResolvedValue([]),
    saveNodes: jest.fn().mockResolvedValue(undefined),
    getTreeViewExpandedItems: jest.fn().mockResolvedValue([]),
    saveTreeViewExpandedItems: jest.fn().mockResolvedValue(undefined),
    getTreeViewSelectedItemId: jest.fn().mockResolvedValue(undefined),
    saveTreeViewSelectedItemId: jest.fn().mockResolvedValue(undefined),

    // その他のAPI
    openDialog: jest.fn(),
    saveFile: jest.fn(),
    loadFile: jest.fn()
  },
  writable: true
});

// console.errorを抑制（必要に応じて）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
