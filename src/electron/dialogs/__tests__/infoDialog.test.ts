import { BrowserWindow } from 'electron';
import InfoDialog from '../infoDialog';

// Mock Electron
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      setWindowOpenHandler: jest.fn()
    },
    once: jest.fn(),
    show: jest.fn()
  })),
  shell: {
    openExternal: jest.fn()
  }
}));

describe('InfoDialog', () => {
  let infoDialog: InfoDialog;
  let mockChildWindow: {
    loadURL: jest.Mock;
    webContents: { setWindowOpenHandler: jest.Mock };
    once: jest.Mock;
    show: jest.Mock;
  };

  beforeEach(() => {
    infoDialog = new InfoDialog();
    // Get the mock instance of BrowserWindow
    mockChildWindow = new BrowserWindow() as unknown as {
      loadURL: jest.Mock;
      webContents: { setWindowOpenHandler: jest.Mock };
      once: jest.Mock;
      show: jest.Mock;
    };
    (BrowserWindow as unknown as jest.Mock).mockClear();
    (BrowserWindow as unknown as jest.Mock).mockReturnValue(mockChildWindow);
  });

  test('should display correct version and github URL', () => {
    const mockParentWindow = {} as BrowserWindow;
    const version = '1.0.0';
    const githubUrl = 'https://github.com/example/repo';

    infoDialog.show(mockParentWindow, version, githubUrl);

    const loadURLCall = (mockChildWindow.loadURL as jest.Mock).mock.calls[0][0];
    // Check if the HTML content contains the version and URL
    // Decode URI component to check the raw HTML string
    const decodedContent = decodeURIComponent(
      loadURLCall.replace('data:text/html;charset=utf-8,', '')
    );

    expect(decodedContent).toContain(`バージョン: v${version}`);
    expect(decodedContent).toContain(`href="${githubUrl}"`);
    expect(decodedContent).toContain(`>${githubUrl}</a>`);
  });
});
