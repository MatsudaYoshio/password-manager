import { app } from 'electron';
import Store from 'electron-store';
import { isDevelopment } from './utils/environment';

const store = new Store({
  // 開発時のみ '-dev'をつけたディレクトリに config.json を保存する
  cwd: isDevelopment() ? `${app.getPath('userData')}-dev` : app.getPath('userData')
});

export default store;
