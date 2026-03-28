import { app, BrowserWindow } from 'electron';
import MainWindow from '../mainWindow';

jest.mock('electron', () => {
  const mockBrowserWindow = jest.fn();
  mockBrowserWindow.prototype.loadFile = jest.fn();
  mockBrowserWindow.prototype.once = jest.fn();
  mockBrowserWindow.prototype.on = jest.fn();
  mockBrowserWindow.prototype.show = jest.fn();
  mockBrowserWindow.prototype.hide = jest.fn();
  mockBrowserWindow.prototype.restore = jest.fn();
  mockBrowserWindow.prototype.focus = jest.fn();
  mockBrowserWindow.prototype.isMinimized = jest.fn();
  mockBrowserWindow.prototype.isVisible = jest.fn();

  return {
    BrowserWindow: mockBrowserWindow,
    app: {
      quit: jest.fn(),
      on: jest.fn()
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

  it('second_instance_event_restores_and_focuses_minimized_window', () => {
    // Given
    const onCalls = (app.on as jest.Mock).mock.calls;
    const secondInstanceCall = onCalls.find(call => call[0] === 'second-instance');

    expect(secondInstanceCall).toBeDefined();
    expect(secondInstanceCall[1]).toBeInstanceOf(Function);

    const secondInstanceHandler = secondInstanceCall[1];

    (sut.isMinimized as jest.Mock).mockReturnValue(true);
    (sut.isVisible as jest.Mock).mockReturnValue(false);

    // When
    secondInstanceHandler();

    // Then
    expect(sut.restore).toHaveBeenCalledTimes(1);
    expect(sut.show).toHaveBeenCalledTimes(1);
    expect(sut.focus).toHaveBeenCalledTimes(1);
  });

  it('second_instance_event_focuses_visible_window', () => {
    // Given
    const onCalls = (app.on as jest.Mock).mock.calls;
    const secondInstanceCall = onCalls.find(call => call[0] === 'second-instance');

    const secondInstanceHandler = secondInstanceCall[1];

    (sut.isMinimized as jest.Mock).mockReturnValue(false);
    (sut.isVisible as jest.Mock).mockReturnValue(true);

    // When
    secondInstanceHandler();

    // Then
    expect(sut.restore).not.toHaveBeenCalled();
    expect(sut.show).not.toHaveBeenCalled();
    expect(sut.focus).toHaveBeenCalledTimes(1);
  });
});
