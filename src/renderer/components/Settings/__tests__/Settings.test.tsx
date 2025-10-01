import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test/test-utils';
import Settings from '../Settings';
import { BackupSettings } from '../../../../shared/types/BackupSettings';

// テスト用のモックAPI
const mockApi = {
  getBackupSettings: jest.fn(),
  updateSetting: jest.fn(),
  selectBackupPath: jest.fn()
};

describe('Settings', () => {
  // テスト用のデフォルト設定
  const defaultBackupSettings: BackupSettings = {
    backupEnabled: false,
    backupPath: ''
  };

  // テスト用の設定作成ヘルパー
  const createBackupSettings = (overrides: Partial<BackupSettings> = {}): BackupSettings => ({
    ...defaultBackupSettings,
    ...overrides
  });

  // 共通の要素取得ヘルパー
  const getCheckbox = () => screen.getByRole('checkbox');
  const getPathField = () => screen.getByLabelText('バックアップ先パス');
  const getBrowseButton = () => screen.getByRole('button', { name: 'browse-backup-path' });

  // 共通の期待値チェックヘルパー
  const expectAllElementsToBePresent = () => {
    expect(screen.getByLabelText('自動バックアップする')).toBeInTheDocument();
    expect(getPathField()).toBeInTheDocument();
    expect(getBrowseButton()).toBeInTheDocument();
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // 既存のwindow.apiモックを更新
    Object.assign(window.api, mockApi);

    mockApi.getBackupSettings.mockResolvedValue(defaultBackupSettings);
    mockApi.updateSetting.mockResolvedValue(undefined);
    mockApi.selectBackupPath.mockResolvedValue(null);
  });

  describe('rendering', () => {
    it('renders settings component in default state', async () => {
      render(<Settings />);

      expectAllElementsToBePresent();

      // useEffectの完了を待つ
      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      expect(getCheckbox()).not.toBeChecked();
      expect(getPathField()).toHaveValue('');
    });

    it('renders settings component with enabled backup', async () => {
      const enabledSettings = createBackupSettings({
        backupEnabled: true,
        backupPath: '/test/backup/path'
      });
      mockApi.getBackupSettings.mockResolvedValue(enabledSettings);

      render(<Settings />);

      expectAllElementsToBePresent();

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(getCheckbox()).toBeChecked();
        expect(getPathField()).toHaveValue('/test/backup/path');
      });
    });

    it('renders settings component when API fails', async () => {
      mockApi.getBackupSettings.mockRejectedValue(new Error('API Error'));

      render(<Settings />);

      expectAllElementsToBePresent();
      expect(getCheckbox()).not.toBeChecked();
      expect(getPathField()).toHaveValue('');
    });
  });

  describe('checkbox interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('enables backup when checkbox is clicked', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      const checkbox = getCheckbox();
      expect(checkbox).not.toBeChecked();

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).toBeChecked();
      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupEnabled', true);
    });

    it('disables backup when checkbox is clicked', async () => {
      const enabledSettings = createBackupSettings({
        backupEnabled: true,
        backupPath: '/test/path'
      });
      mockApi.getBackupSettings.mockResolvedValue(enabledSettings);

      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(getCheckbox()).toBeChecked();
      });

      const checkbox = getCheckbox();

      await act(async () => {
        await user.click(checkbox);
      });

      expect(checkbox).not.toBeChecked();
      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupEnabled', false);
    });
  });

  describe('path field interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('updates path when text field is changed', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      const pathField = getPathField();

      await act(async () => {
        await user.type(pathField, '/new/backup/path');
      });

      expect(pathField).toHaveValue('/new/backup/path');
      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupPath', '/new/backup/path');
    });

    it('clears path when text field is cleared', async () => {
      const settingsWithPath = createBackupSettings({ backupPath: '/existing/path' });
      mockApi.getBackupSettings.mockResolvedValue(settingsWithPath);

      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(getPathField()).toHaveValue('/existing/path');
      });

      const pathField = getPathField();

      await act(async () => {
        await user.clear(pathField);
      });

      expect(pathField).toHaveValue('');
      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupPath', '');
    });
  });

  describe('browse button interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('opens path selection dialog when browse button is clicked', async () => {
      const selectedPath = '/selected/backup/path';
      mockApi.selectBackupPath.mockResolvedValue(selectedPath);

      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      const browseButton = getBrowseButton();

      await act(async () => {
        await user.click(browseButton);
      });

      expect(mockApi.selectBackupPath).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(getPathField()).toHaveValue(selectedPath);
      });

      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupPath', selectedPath);
    });

    it('does not update path when dialog is cancelled', async () => {
      const initialPath = '/initial/path';
      const settingsWithPath = createBackupSettings({ backupPath: initialPath });
      mockApi.getBackupSettings.mockResolvedValue(settingsWithPath);
      mockApi.selectBackupPath.mockResolvedValue(null);

      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(getPathField()).toHaveValue(initialPath);
      });

      const browseButton = getBrowseButton();

      await act(async () => {
        await user.click(browseButton);
      });

      expect(mockApi.selectBackupPath).toHaveBeenCalledTimes(1);
      expect(getPathField()).toHaveValue(initialPath);
    });
  });

  describe('error handling', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('handles updateSetting API errors gracefully', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      // updateSettingをエラーにする（beforeEachの後で設定）
      mockApi.updateSetting.mockRejectedValue(new Error('Update failed'));

      const checkbox = getCheckbox();

      await act(async () => {
        await user.click(checkbox);
      });

      // UIは楽観的に更新される
      expect(checkbox).toBeChecked();
      expect(mockApi.updateSetting).toHaveBeenCalledWith('backupEnabled', true);
    });

    it('handles selectBackupPath API errors gracefully', async () => {
      mockApi.selectBackupPath.mockRejectedValue(new Error('Path selection failed'));

      render(<Settings />);

      await waitFor(() => {
        expect(mockApi.getBackupSettings).toHaveBeenCalledTimes(1);
      });

      const browseButton = getBrowseButton();

      await act(async () => {
        await user.click(browseButton);
      });

      expect(mockApi.selectBackupPath).toHaveBeenCalledTimes(1);
      // エラーが発生してもUIは正常に表示される
      expectAllElementsToBePresent();
    });
  });
});
