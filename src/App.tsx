import React from 'react';
import Popup from './Popup';

const App: React.FC = () => {
  return (
    <div className="min-w-80 w-popup max-w-popup overflow-hidden">
      <Popup />
    </div>
  );
};

export default App;