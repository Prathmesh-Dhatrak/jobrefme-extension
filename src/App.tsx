import React from 'react';
import { AppProvider } from './contexts/AppContext';
import Popup from './Popup';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-w-80 w-popup max-w-popup overflow-hidden">
        <Popup />
      </div>
    </AppProvider>
  );
};

export default App;