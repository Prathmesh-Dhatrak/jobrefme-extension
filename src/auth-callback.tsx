import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import './index.css';
import AuthCallback from './pages/AuthCallback';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AuthCallback />
    </AppProvider>
  </React.StrictMode>,
);