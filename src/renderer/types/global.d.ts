import { ElectronAPI } from '../../shared/types/ElectronAPI';

declare module '*.css';
declare module 'normalize.css';

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
