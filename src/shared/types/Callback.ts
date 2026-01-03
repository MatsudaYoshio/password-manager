export type DataCallback<T> = (data: T) => void;
export type VoidCallback = () => void;
export type IpcEventHandler = (event: Electron.IpcRendererEvent) => void;
