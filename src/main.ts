import { app } from "electron";
import setupIpcHandlers from "./ipcHandlers";
import MainMenu from "./mainMenu";
import MainWindow from "./mainWindow";
import PasswordManagerTray from "./passwordManagerTray";

const createWindow = () => {
  const mainWindow = new MainWindow();
  new PasswordManagerTray(mainWindow);
  new MainMenu(mainWindow);
};

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

app.once("window-all-closed", () => app.quit());
