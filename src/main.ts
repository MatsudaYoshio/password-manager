import { app } from "electron";
import setupIpcHandlers from "./ipcHandlers";
import setUpMainMenu from "./mainMenu";
import MainWindow from "./mainWindow";
import passwordManagerTray from "./passwordManagerTray";

const createWindow = () => {
  const mainWindow = new MainWindow();
  new passwordManagerTray(mainWindow);
};

app.whenReady().then(() => {
  createWindow();
  setUpMainMenu();
  setupIpcHandlers();
});

app.once("window-all-closed", () => app.quit());
