import '@testing-library/jest-dom';

// Electronのモック（プロジェクトの実際のAPIに合わせて）
Object.defineProperty(window, 'api', {
  value: {
    // TreeNode関連のAPI
    readNodes: jest.fn().mockResolvedValue([]),
    saveNodes: jest.fn().mockResolvedValue(true),
    getTreeViewExpandedItems: jest.fn().mockResolvedValue([]),
    saveTreeViewExpandedItems: jest.fn(),
    getTreeViewSelectedItemId: jest.fn().mockResolvedValue(undefined),
    saveTreeViewSelectedItemId: jest.fn(),

    // その他のAPI
    exportNodes: jest.fn().mockResolvedValue(undefined),
    onImportData: jest.fn(),
    getBackupSettings: jest.fn().mockResolvedValue({}),
    updateSetting: jest.fn().mockResolvedValue(undefined),
    selectBackupPath: jest.fn().mockResolvedValue(null),

    // Event listeners
    onSaveData: jest.fn(),
    offSaveData: jest.fn(),
    onAddTopItem: jest.fn(),
    offAddTopItem: jest.fn(),
    onAddSubItem: jest.fn(),
    offAddSubItem: jest.fn(),
    onRemoveSubtree: jest.fn(),
    offRemoveSubtree: jest.fn(),
    onExportData: jest.fn(),
    offExportData: jest.fn()
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
