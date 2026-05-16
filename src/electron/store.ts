import { app } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { isDevelopment } from './utils/environment';

const store = new Store({
  // 開発時のみ '-dev'をつけたディレクトリに config.json を保存する
  cwd: isDevelopment()
    ? path.join(app.getPath('appData'), `${app.getName()}-dev`)
    : app.getPath('userData')
});

export default store;
