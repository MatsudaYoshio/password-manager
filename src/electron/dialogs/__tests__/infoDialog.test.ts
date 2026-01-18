import { BrowserWindow, shell } from 'electron';
import InfoDialog from '../infoDialog';

// Mock Electron
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      setWindowOpenHandler: jest.fn()
    },
    once: jest.fn(),
    show: jest.fn(),
    setParentWindow: jest.fn(),
    close: jest.fn(),
    hide: jest.fn()
  })),
  shell: {
    openExternal: jest.fn()
  }
}));

jest.mock('../../../../package.json', () => ({ version: '1.2.3' }), { virtual: true });
jest.mock(
  '../../../../electron-builder.json',
  () => ({
    publish: { owner: 'test-owner', repo: 'test-repo' }
  }),
  { virtual: true }
);

describe('InfoDialog', () => {
  let infoDialog: InfoDialog;
  let mockChildWindow: {
    loadURL: jest.Mock;
    webContents: { setWindowOpenHandler: jest.Mock };
    once: jest.Mock;
    show: jest.Mock;
    setParentWindow: jest.Mock;
    close: jest.Mock;
    hide: jest.Mock;
  };

  beforeEach(() => {
    infoDialog = new InfoDialog();
    // Get the mock instance of BrowserWindow
    mockChildWindow = new BrowserWindow() as unknown as {
      loadURL: jest.Mock;
      webContents: { setWindowOpenHandler: jest.Mock };
      once: jest.Mock;
      show: jest.Mock;
      setParentWindow: jest.Mock;
      close: jest.Mock;
      hide: jest.Mock;
    };
    (BrowserWindow as unknown as jest.Mock).mockClear();
    (BrowserWindow as unknown as jest.Mock).mockReturnValue(mockChildWindow);
  });

  test('should display correct version and github URL from metadata', () => {
    const mockParentWindow = {} as BrowserWindow;
    const expectedVersion = '1.2.3';
    const expectedUrl = 'https://github.com/test-owner/test-repo/releases/tag/1.2.3';

    infoDialog.show(mockParentWindow);

    const loadURLCall = (mockChildWindow.loadURL as jest.Mock).mock.calls[0][0];
    const decodedContent = decodeURIComponent(
      loadURLCall.replace('data:text/html;charset=utf-8,', '')
    );

    expect(decodedContent).toContain(`バージョン: v${expectedVersion}`);
    expect(decodedContent).toContain(`href="${expectedUrl}"`);
    expect(decodedContent).toContain(`>${expectedUrl}</a>`);
    expect(decodedContent).toContain(`onclick="window.open('http://close-dialog', '_blank')"`);
  });

  test('should open external URL using shell.openExternal', () => {
    const mockParentWindow = {} as BrowserWindow;

    infoDialog.show(mockParentWindow);

    const handler = (mockChildWindow.webContents.setWindowOpenHandler as jest.Mock).mock
      .calls[0][0];
    const testUrl = 'https://example.com';
    const result = handler({ url: testUrl });

    expect(shell.openExternal).toHaveBeenCalledWith(testUrl);
    expect(result).toEqual({ action: 'deny' });
  });

  test('should handle custom close URL by hiding and closing window', () => {
    const mockParentWindow = {} as BrowserWindow;

    infoDialog.show(mockParentWindow);

    const handler = (mockChildWindow.webContents.setWindowOpenHandler as jest.Mock).mock
      .calls[0][0];
    const result = handler({ url: 'http://close-dialog/' });

    expect(mockChildWindow.hide).toHaveBeenCalled();
    expect(mockChildWindow.close).toHaveBeenCalled();
    expect(result).toEqual({ action: 'deny' });
  });
});
