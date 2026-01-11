import { app, BrowserWindow, dialog, Menu, MenuItemConstructorOptions } from 'electron';
import * as fs from 'fs';

import * as electronBuilder from '../../electron-builder.json';
import * as packageJson from '../../package.json';

import InfoDialog from './dialogs/infoDialog';
import QuestionDialog from './dialogs/questionDialog';
import SettingsWindow from './subWindows/settingsWindow';
import { isDevelopment } from './utils/environment';

const readFile2String = (path: fs.PathOrFileDescriptor, encoding: BufferEncoding = 'utf-8') =>
  fs.readFileSync(path, encoding);

class MainMenu {
  constructor(mainWindow: BrowserWindow) {
    const questionDialog = new QuestionDialog();
    const infoDialog = new InfoDialog();

    const menuTemplate = [
      {
        label: 'ファイル',
        submenu: [
          {
            label: 'データの保存',
            accelerator: 'CmdOrCtrl+S',
            click: () => mainWindow.webContents.send('save-data')
          },
          {
            label: 'データのエクスポート',
            click: () => mainWindow.webContents.send('export-data')
          },
          {
            label: 'データのインポート',
            click: async () => {
              questionDialog.showMessageBox(
                '現在のデータを消去して新たなデータを読み込みます。よろしいですか？',
                () => {
                  dialog
                    .showOpenDialog({
                      properties: ['openFile'],
                      title: 'インポートしたいデータファイルの選択',
                      filters: [
                        {
                          name: 'JSONファイル',
                          extensions: ['json']
                        }
                      ]
                    })
                    .then(result => {
                      if (result.canceled) return;
                      mainWindow.webContents.send(
                        'import-data',
                        JSON.parse(readFile2String(result.filePaths[0]))
                      );
                    })
                    .catch(err => {
                      console.log('[Error Log]', err);
                      let message = 'JSONファイルの解析に失敗しました。';
                      if (err instanceof SyntaxError) {
                        message =
                          'JSONファイルの内容がJSON形式として不正なので読み込みに失敗しました。';
                      }
                      dialog.showMessageBox({
                        type: 'warning',
                        message: message
                      });
                    });
                }
              );
            }
          },
          {
            label: 'アプリを終了',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: '編集',
        submenu: [
          {
            label: '最上位項目の追加',
            click: () => mainWindow.webContents.send('add-top-item')
          },
          {
            label: 'サブ項目の追加',
            click: () => mainWindow.webContents.send('add-sub-item')
          },
          {
            label: '項目の削除',
            click: () => mainWindow.webContents.send('remove-subtree')
          },
          ...(isDevelopment()
            ? [
                {
                  role: 'toggledevtools'
                }
              ]
            : [])
        ]
      },
      {
        label: '設定',
        submenu: [
          {
            label: '設定',
            click: () => {
              SettingsWindow.focusOrCreate(mainWindow);
            }
          }
        ]
      },
      {
        label: '情報',
        submenu: [
          {
            label: 'バージョン',
            click: () => {
              const version = packageJson.version;
              const owner = electronBuilder.publish.owner;
              const repo = electronBuilder.publish.repo;
              const url = `https://github.com/${owner}/${repo}/releases/tag/${version}`;
              infoDialog.show(mainWindow, version, url);
            }
          }
        ]
      }
    ] as MenuItemConstructorOptions[];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  }
}

export default MainMenu;
