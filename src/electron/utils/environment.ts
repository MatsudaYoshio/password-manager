import { app } from 'electron';

/**
 * 開発環境かどうかを判定する
 * NODE_ENVがdevelopmentまたはアプリがパッケージ化されていない場合は開発環境とみなす
 */
export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * 本番環境かどうかを判定する
 */
export const isProduction = (): boolean => !isDevelopment();
