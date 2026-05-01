declare module '*.css';
declare module 'normalize.css';

interface Window {
  api: import('../../shared/types/ElectronAPI').ElectronAPI;
}
