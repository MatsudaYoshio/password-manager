import { app, Menu, MenuItemConstructorOptions } from "electron";

const setUpMainMenu = () => Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

const menuTemplate = [
  {
    label: "ファイル",
    submenu: [
      {
        label: "データの保存",
        accelerator: "CmdOrCtrl+S",
      },
      {
        label: "アプリを終了",
        accelerator: "CmdOrCtrl+Q",
        click: () => app.quit(),
      },
    ],
  },
  ...(process.env.NODE_ENV === "development"
    ? [
        {
          label: "編集",
          submenu: [
            {
              role: "toggledevtools",
            },
          ],
        },
      ]
    : []),
  ,
] as MenuItemConstructorOptions[];

export default setUpMainMenu;
