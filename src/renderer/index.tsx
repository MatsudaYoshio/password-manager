import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'normalize.css';

import store, { initializeProductionStore } from './store/index';
import { App } from './App';

// アプリケーション初期化コンポーネント
const AppWithInitialization = () => {
  const [initializedStore, setInitializedStore] = React.useState(store);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        const productionStore = await initializeProductionStore();
        setInitializedStore(productionStore);
      } catch (error) {
        console.warn('Failed to initialize production store:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Provider store={initializedStore!}>
      <App />
    </Provider>
  );
};

createRoot(document.getElementById('root') as Element).render(
  <React.StrictMode>
    <AppWithInitialization />
  </React.StrictMode>
);
