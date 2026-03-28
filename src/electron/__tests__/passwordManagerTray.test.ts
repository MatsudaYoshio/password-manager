import { BrowserWindow } from 'electron';
import PasswordManagerTray from '../passwordManagerTray';

jest.mock('electron', () => {
  const mockTray = jest.fn();
  mockTray.prototype.setToolTip = jest.fn();
  mockTray.prototype.on = jest.fn();
  mockTray.prototype.popUpContextMenu = jest.fn();

  return {
    app: { quit: jest.fn() },
    BrowserWindow: jest.fn(),
    Menu: { buildFromTemplate: jest.fn().mockReturnValue({}) },
    Tray: mockTray
  };
});

describe('PasswordManagerTray', () => {
  let mockMainWindow: jest.Mocked<BrowserWindow>;
  let sut: PasswordManagerTray;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMainWindow = {
      isVisible: jest.fn(),
      hide: jest.fn(),
      show: jest.fn(),
      restore: jest.fn()
    } as unknown as jest.Mocked<BrowserWindow>;

    sut = new PasswordManagerTray(mockMainWindow);
  });

  describe('onClick', () => {
    it('window_hides_when_it_is_visible', () => {
      // Given
      mockMainWindow.isVisible.mockReturnValue(true);

      // When
      sut.onClick();

      // Then
      expect(mockMainWindow.hide).toHaveBeenCalledTimes(1);
      expect(mockMainWindow.show).not.toHaveBeenCalled();
    });

    it('window_shows_and_restores_when_it_is_not_visible', () => {
      // Given
      mockMainWindow.isVisible.mockReturnValue(false);

      // When
      sut.onClick();

      // Then
      expect(mockMainWindow.show).toHaveBeenCalledTimes(1);
      expect(mockMainWindow.restore).toHaveBeenCalledTimes(1);
      expect(mockMainWindow.hide).not.toHaveBeenCalled();
    });
  });
});
