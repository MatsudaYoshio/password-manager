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

  // privateなinstanceプロパティにアクセスするためのヘルパー
  const getInstance = () =>
    (SettingsWindow as unknown as { instance: SettingsWindow | null }).instance;
  const setInstance = (value: SettingsWindow | null) => {
    (SettingsWindow as unknown as { instance: SettingsWindow | null }).instance = value;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // シングルトンインスタンスをリセット
    setInstance(null);
    parentWindow = new BrowserWindow();
    (isDevelopment as jest.Mock).mockReturnValue(false);
  });

  describe('focusOrCreate', () => {
    test('should create window with correct options on first call', () => {
      SettingsWindow.focusOrCreate(parentWindow);

      const lastCall = (BrowserWindow as unknown as jest.Mock).mock.lastCall[0];

      expect(lastCall.width).toBe(800);
      expect(lastCall.height).toBe(600);
      expect(lastCall.title).toBe('設定');
      expect(lastCall.parent).toBe(parentWindow);
      expect(lastCall.webPreferences.nodeIntegration).toBe(false);
      expect(lastCall.webPreferences.contextIsolation).toBe(true);
      expect(lastCall.webPreferences.preload).toContain('preload.js');
      expect(lastCall.icon).toBe(ICON_PATH);
    });

    test('should load settings.html file', () => {
      SettingsWindow.focusOrCreate(parentWindow);

      const instance = getInstance();
      const loadFileCall = (instance?.loadFile as jest.Mock).mock.calls[0][0];
      expect(loadFileCall).toContain('settings.html');
    });

    test('should set menu bar visibility based on isDevelopment', () => {
      (isDevelopment as jest.Mock).mockReturnValue(true);
      SettingsWindow.focusOrCreate(parentWindow);

      const instance = getInstance();
      expect(instance?.setMenuBarVisibility).toHaveBeenCalledWith(true);
    });

    test('should hide menu bar in production', () => {
      (isDevelopment as jest.Mock).mockReturnValue(false);
      SettingsWindow.focusOrCreate(parentWindow);

      const instance = getInstance();
      expect(instance?.setMenuBarVisibility).toHaveBeenCalledWith(false);
    });

    test('should register closed event handler', () => {
      SettingsWindow.focusOrCreate(parentWindow);

      const instance = getInstance();
      expect(instance?.on).toHaveBeenCalledWith('closed', expect.any(Function));
    });

    test('should set instance to null on closed event', () => {
      SettingsWindow.focusOrCreate(parentWindow);

      const instance = getInstance();
      const closedHandler = (instance?.on as jest.Mock).mock.calls[0][1];

      expect(closedHandler).toBeDefined();
      closedHandler();

      expect(getInstance()).toBeNull();
    });

    test('should focus existing window if not destroyed', () => {
      SettingsWindow.focusOrCreate(parentWindow);
      const instance = getInstance();
      (instance?.isDestroyed as jest.Mock).mockReturnValue(false);

      const initialCallCount = (BrowserWindow as unknown as jest.Mock).mock.calls.length;
      SettingsWindow.focusOrCreate(parentWindow);

      expect(BrowserWindow).toHaveBeenCalledTimes(initialCallCount);
      expect(instance?.focus).toHaveBeenCalled();
    });

    test('should create new window if instance is destroyed', () => {
      SettingsWindow.focusOrCreate(parentWindow);
      const firstInstance = getInstance();
      (firstInstance?.isDestroyed as jest.Mock).mockReturnValue(true);

      const initialCallCount = (BrowserWindow as unknown as jest.Mock).mock.calls.length;
      SettingsWindow.focusOrCreate(parentWindow);

      expect(BrowserWindow).toHaveBeenCalledTimes(initialCallCount + 1);
      expect(getInstance()).not.toBe(firstInstance);
    });

    test('should create new window if instance is null', () => {
      SettingsWindow.focusOrCreate(parentWindow);
      setInstance(null);

      const initialCallCount = (BrowserWindow as unknown as jest.Mock).mock.calls.length;
      SettingsWindow.focusOrCreate(parentWindow);

      expect(BrowserWindow).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });
});
