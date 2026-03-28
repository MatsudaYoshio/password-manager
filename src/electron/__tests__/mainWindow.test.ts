import { BrowserWindow } from 'electron';
import MainWindow from '../mainWindow';

jest.mock('electron', () => {
  const mockBrowserWindow = jest.fn();
  mockBrowserWindow.prototype.loadFile = jest.fn();
  mockBrowserWindow.prototype.once = jest.fn();
  mockBrowserWindow.prototype.on = jest.fn();
  mockBrowserWindow.prototype.show = jest.fn();
  mockBrowserWindow.prototype.hide = jest.fn();

  return {
    BrowserWindow: mockBrowserWindow,
    app: {
      quit: jest.fn()
    }
  };
});

jest.mock('../autoBackup', () => ({
  setupAutoBackup: jest.fn()
}));

describe('MainWindow', () => {
  let sut: MainWindow;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new MainWindow();
  });

  it('window_hides_to_task_tray_when_minimize_button_is_clicked', () => {
    // Given
    const onCalls = (BrowserWindow.prototype.on as jest.Mock).mock.calls;
    const minimizeHandlerCall = onCalls.find(call => call[0] === 'minimize');

    expect(minimizeHandlerCall).toBeDefined();
    expect(minimizeHandlerCall[1]).toBeInstanceOf(Function);

    const minimizeHandler = minimizeHandlerCall[1];

    // When
    minimizeHandler();

    // Then
    expect(sut.hide).toHaveBeenCalledTimes(1);
  });
});
