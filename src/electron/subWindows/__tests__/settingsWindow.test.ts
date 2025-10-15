import { BrowserWindow } from 'electron';
import SettingsWindow from '../settingsWindow';
import { ICON_PATH } from '../../../shared/constants';
import { isDevelopment } from '../../utils/environment';

// Electronのモジュールをモック
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(function (this: unknown, options: unknown) {
    const self = this as Record<string, unknown>;
    self.options = options;
    self.destroyed = false;
    self.loadFile = jest.fn();
    self.setMenuBarVisibility = jest.fn();
    self.on = jest.fn();
    self.destroy = jest.fn(() => {
      self.destroyed = true;
    });
    self.focus = jest.fn();
    self.isDestroyed = jest.fn(() => self.destroyed);
    return this;
  })
}));

jest.mock('../../utils/environment', () => ({
  isDevelopment: jest.fn()
}));

jest.mock('../../../shared/constants', () => ({
  ICON_PATH: '/path/to/icon.png'
}));

describe('SettingsWindow', () => {
  let parentWindow: BrowserWindow;
  let settingsWindow: SettingsWindow;

  beforeEach(() => {
    jest.clearAllMocks();
    parentWindow = new BrowserWindow();
    (isDevelopment as jest.Mock).mockReturnValue(false);
  });

  describe('constructor', () => {
    test('should create window with correct options', () => {
      settingsWindow = new SettingsWindow(parentWindow);

      const calls = (BrowserWindow as unknown as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1][0];

      expect(lastCall.width).toBe(800);
      expect(lastCall.height).toBe(600);
      expect(lastCall.title).toBe('設定');
      expect(lastCall.parent).toBe(parentWindow);
      expect(lastCall.modal).toBe(true);
      expect(lastCall.webPreferences.nodeIntegration).toBe(false);
      expect(lastCall.webPreferences.contextIsolation).toBe(true);
      expect(lastCall.webPreferences.preload).toContain('preload.js');
      expect(lastCall.icon).toBe(ICON_PATH);
    });

    test('should load settings.html file', () => {
      settingsWindow = new SettingsWindow(parentWindow);

      const loadFileCall = (settingsWindow.loadFile as jest.Mock).mock.calls[0][0];
      expect(loadFileCall).toContain('settings.html');
    });

    test('should set menu bar visibility based on isDevelopment', () => {
      (isDevelopment as jest.Mock).mockReturnValue(true);
      settingsWindow = new SettingsWindow(parentWindow);

      expect(settingsWindow.setMenuBarVisibility).toHaveBeenCalledWith(true);
    });

    test('should hide menu bar in production', () => {
      (isDevelopment as jest.Mock).mockReturnValue(false);
      settingsWindow = new SettingsWindow(parentWindow);

      expect(settingsWindow.setMenuBarVisibility).toHaveBeenCalledWith(false);
    });

    test('should register closed event handler', () => {
      settingsWindow = new SettingsWindow(parentWindow);

      expect(settingsWindow.on).toHaveBeenCalledWith('closed', expect.any(Function));
    });

    test('should destroy window on closed event', () => {
      settingsWindow = new SettingsWindow(parentWindow);

      const closedHandler = (settingsWindow.on as jest.Mock).mock.calls.find(
        call => call[0] === 'closed'
      )?.[1];

      expect(closedHandler).toBeDefined();
      closedHandler();

      expect(settingsWindow.destroy).toHaveBeenCalled();
    });
  });

  describe('focusOrCreate', () => {
    test('should focus existing window if not destroyed', () => {
      settingsWindow = new SettingsWindow(parentWindow);
      (settingsWindow.isDestroyed as jest.Mock).mockReturnValue(false);

      settingsWindow.focusOrCreate(parentWindow);

      expect(settingsWindow.focus).toHaveBeenCalled();
    });

    test('should create new window if destroyed', () => {
      settingsWindow = new SettingsWindow(parentWindow);
      (settingsWindow.isDestroyed as jest.Mock).mockReturnValue(true);

      const initialCallCount = (BrowserWindow as unknown as jest.Mock).mock.calls.length;
      settingsWindow.focusOrCreate(parentWindow);

      expect(BrowserWindow).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });
});
