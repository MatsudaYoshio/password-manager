import { contextBridge, ipcRenderer } from "electron";
import TreeNode from "./web/models/treeNode";

contextBridge.exposeInMainWorld("api", {
  readNodes: () => ipcRenderer.invoke("read-nodes"),
  saveNodes: (nodes: TreeNode[]) => ipcRenderer.invoke("save-nodes", nodes),
  importData: (parsedObject: any) => ipcRenderer.invoke("import-data", parsedObject),

  onSaveData: (callback: any) => ipcRenderer.once("save-data", () => callback()),
  offSaveData: () => ipcRenderer.removeAllListeners("save-data"),

  onAddTopItem: (callback: any) => ipcRenderer.once("add-top-item", () => callback()),
  offAddTopItem: () => ipcRenderer.removeAllListeners("add-top-item"),

  onAddSubItem: (callback: any) => ipcRenderer.once("add-sub-item", () => callback()),
  offAddSubItem: () => ipcRenderer.removeAllListeners("add-sub-item"),

  onRemoveSubtree: (callback: any) => ipcRenderer.once("remove-subtree", () => callback()),
  offRemoveSubtree: () => ipcRenderer.removeAllListeners("remove-subtree"),

  onImportData: (callback: any) => ipcRenderer.on("import-data", (_event, parsedObject) => callback(parsedObject)),
});
