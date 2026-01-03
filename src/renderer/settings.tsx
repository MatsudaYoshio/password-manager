import React from 'react';
import { createRoot } from 'react-dom/client';
import Settings from './components/Settings/Settings';

createRoot(document.getElementById('root') as Element).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>
);
