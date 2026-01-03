import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow, app } from 'electron';

export class AutoUpdater {
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  private setupAutoUpdater(): void {
    // 開発環境用の設定
    if (!app.isPackaged) {
      // 開発環境では実際のGitHubをチェック（テスト用）
      console.log('Development mode: Auto-updater will check GitHub releases');
    }

    // GitHub Releases からの更新を有効化
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', info => {
      dialog
        .showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'アップデートが利用可能です',
          message: `新しいバージョン (${info.version}) が利用可能です。今すぐダウンロードしますか？`,
          buttons: ['ダウンロード', '後で'],
          defaultId: 0,
          cancelId: 1
        })
        .then(result => {
          if (result.response === 0) {
            autoUpdater.downloadUpdate();
          }
        });
    });

    autoUpdater.on('update-not-available', () => {
      // サイレントに処理（起動時チェックのため）
      if (!app.isPackaged) {
        console.log('No updates available (current version is up to date)');
      }
    });

    autoUpdater.on('download-progress', progressObj => {
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
      this.mainWindow.setProgressBar(progressObj.percent / 100);
      console.log(message);
    });

    autoUpdater.on('update-downloaded', () => {
      this.mainWindow.setProgressBar(-1);
      dialog
        .showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'アップデート準備完了',
          message:
            'アップデートのダウンロードが完了しました。アプリケーションを再起動してインストールします。',
          buttons: ['今すぐ再起動', '後で'],
          defaultId: 0,
          cancelId: 1
        })
        .then(result => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall(false, true);
          }
        });
    });

    autoUpdater.on('error', error => {
      const errorMessage = error.message.toLowerCase();

      // latest.yml が見つからない場合は警告のみ表示して続行
      if (errorMessage.includes('latest.yml') || errorMessage.includes('404')) {
        console.warn('Update check failed: latest.yml not found. Continuing without update check.');
        dialog.showMessageBox(this.mainWindow, {
          type: 'warning',
          title: 'アップデート確認の問題',
          message:
            '最新バージョンの情報を取得できませんでした。配布サーバーに問題がある可能性があります。\n\nアプリケーションは通常通り使用できます。',
          buttons: ['OK']
        });
        return;
      }

      // その他のエラーはログのみ
      console.error('Update check failed:', error);
    });
  }

  public checkForUpdates(): void {
    if (!app.isPackaged) {
      console.log('Checking for updates from GitHub releases...');
    }
    autoUpdater.checkForUpdates();
  }
}
