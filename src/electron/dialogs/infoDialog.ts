import { BrowserWindow, shell } from 'electron';

import * as electronBuilder from '../../../electron-builder.json';
import * as packageJson from '../../../package.json';

class InfoDialog {
  show(parentWindow: BrowserWindow) {
    const version = packageJson.version;
    const { owner, repo } = electronBuilder.publish;
    const githubUrl = `https://github.com/${owner}/${repo}/releases/tag/${version}`;

    const child = new BrowserWindow({
      parent: parentWindow,
      modal: true,
      show: false,
      width: 400,
      height: 250,
      resizable: false,
      minimizable: false,
      title: '', // タイトルを空にする
      frame: false, // タイトルバー（フレーム）を非表示にする
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      },
      autoHideMenuBar: true
    });

    const htmlContent = this.getHtmlContent(version, githubUrl);

    child.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Handle external links
    child.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    child.once('ready-to-show', () => {
      child.show();
    });
  }

  private getHtmlContent(version: string, githubUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: sans-serif; padding: 20px; text-align: center; background-color: #f5f5f5; color: #333; }
          h2 { margin-top: 0; font-size: 18px; }
          p { margin: 10px 0; font-size: 14px; }
          .version { font-weight: bold; }
          a { color: #0066cc; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .button-container { margin-top: 20px; }
          button { padding: 8px 20px; cursor: pointer; background: #fff; border: 1px solid #ccc; border-radius: 4px; }
          button:hover { background: #eee; }
        </style>
      </head>
      <body>
        <h2>バージョン情報</h2>
        <p class="version">バージョン: v${version}</p>
        <p>GitHub: <br><a href="${githubUrl}" target="_blank">${githubUrl}</a></p>
        <div class="button-container">
          <button onclick="window.close()">OK</button>
        </div>
      </body>
      </html>
    `;
  }
}

export default InfoDialog;
