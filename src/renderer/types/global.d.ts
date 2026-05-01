import { ElectronAPI } from '../../shared/types/ElectronAPI';

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
