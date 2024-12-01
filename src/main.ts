import { BrowserWindow, app, dialog, ipcMain } from "electron";
import * as fs from "fs";
import path from "path";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
  });

  const options = {
    silent: true,
    deviceName: "My-Printer",
    pageRanges: [
      {
        from: 0,
        to: 1,
      },
    ],
    margins: { top: 0 },
  };

  mainWindow.webContents.print(options, (success, errorType) => {
    if (!success) console.log(errorType);
  });

  mainWindow.loadFile("dist/index.html");
  // mainWindow.webContents.openDevTools({ mode: "detach" });
};

app.whenReady().then(() => {
  createWindow();
});

app.once("window-all-closed", () => app.quit());

ipcMain.handle("read-nodes", async () => {
  return JSON.parse(fs.readFileSync("data.json", "utf-8"));
});

ipcMain.handle("save-nodes", async (event, data) => {
  const dialogResponses = Object.freeze({
    NO: {
      text: "No",
      id: 0,
    },
    YES: {
      text: "Yes",
      id: 1,
    },
  });

  try {
    const result = await dialog.showMessageBox({
      type: "question",
      message: "現在の内容で保存してもよろしいですか？",
      buttons: Object.values(dialogResponses).map((response) => response.text),
      defaultId: dialogResponses.YES.id,
      cancelId: dialogResponses.NO.id,
    });

    if (result.response === dialogResponses.YES.id) {
      fs.writeFileSync("data.json", JSON.stringify(data));
      return true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    return false;
  }
});
