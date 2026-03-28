/* global require */
import { app } from 'electron';

jest.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    whenReady: jest.fn().mockReturnValue(Promise.resolve())
  }
}));

jest.mock('../ipcHandlers', () => jest.fn());
jest.mock('../mainMenu', () => jest.fn());
jest.mock('../mainWindow', () => {
  return jest.fn().mockImplementation(() => ({
    isMinimized: jest.fn().mockReturnValue(false),
    isVisible: jest.fn().mockReturnValue(true),
    restore: jest.fn(),
    show: jest.fn(),
    focus: jest.fn()
  }));
});
jest.mock('../passwordManagerTray', () => jest.fn());
jest.mock('../autoUpdater', () => ({
  AutoUpdater: jest.fn().mockImplementation(() => ({
    checkForUpdates: jest.fn()
  }))
}));

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const loadMainModule = () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../main');
    });
  };

  it('second_app_instance_quits_immediately', () => {
    // Given
    (app.requestSingleInstanceLock as jest.Mock).mockReturnValue(false);

    // When
    loadMainModule();

    // Then
    expect(app.quit).toHaveBeenCalledTimes(1);
  });

  it('first_app_instance_proceeds_normal_startup', () => {
    // Given
    (app.requestSingleInstanceLock as jest.Mock).mockReturnValue(true);

    // When
    loadMainModule();

    // Then
    expect(app.quit).not.toHaveBeenCalled();
    expect(app.whenReady).toHaveBeenCalled();
  });
});
