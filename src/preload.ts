import { contextBridge, ipcRenderer } from "electron";
import TreeNode from "./web/models/treeNode";

contextBridge.exposeInMainWorld("api", {
  readNodes: () => ipcRenderer.invoke("read-nodes"),
  saveNodes: (nodes: TreeNode[]) => ipcRenderer.invoke("save-nodes", nodes),
});
