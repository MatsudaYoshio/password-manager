import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcRenderer } from "electron";

class MainMenu {
  constructor(mainWindow: BrowserWindow) {
    const menuTemplate = [
      {
        label: "ファイル",
        submenu: [
          {
            label: "データの保存",
            accelerator: "CmdOrCtrl+S",
            click: () => {
              mainWindow.webContents.send("save-data");
            },
          },
          {
            label: "アプリを終了",
            accelerator: "CmdOrCtrl+Q",
            click: () => app.quit(),
          },
        ],
      },
      {
        label: "編集",
        submenu: [
          {
            label: "最上位項目の追加",
            click: () => mainWindow.webContents.send("add-top-item"),
          },
          {
            label: "サブ項目の追加",
            click: () => mainWindow.webContents.send("add-sub-item"),
          },
          {
            label: "項目の削除",
            click: () => mainWindow.webContents.send("remove-subtree"),
          },
          ...(process.env.NODE_ENV === "development"
            ? [
                {
                  role: "toggledevtools",
                },
              ]
            : []),
        ],
      },
    ] as MenuItemConstructorOptions[];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  }
}

export default MainMenu;
