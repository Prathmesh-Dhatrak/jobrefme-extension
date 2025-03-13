import React from 'react';
import { useAppContext } from './contexts/AppContext';
import { ProcessingStatus } from './types';
import StatusIndicator from './components/StatusIndicator';
import GenerateButton from './components/GenerateButton';
import LoadingIndicator from './components/LoadingIndicator';
import ReferenceMessage from './components/ReferenceMessage';
import ErrorDisplay from './components/ErrorDisplay';

const Popup: React.FC = () => {
  const { state, generateReference, reset } = useAppContext();
  
  const handleGenerateClick = () => {
    if (state.isHireJobsUrl && state.currentUrl) {
      if (state.status === ProcessingStatus.COMPLETED) {
        // If we already have a result, reset first
        reset();
      }
      generateReference(state.currentUrl);
    }
  };

  return (
    <div className="p-4 bg-gray-50 flex flex-col" style={{ height: '600px' }}>
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="JobRefMe Logo" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-gray-900">JobRefMe</h1>
        </div>
        <p className="text-xs text-gray-500">Reference Request Generator</p>
      </header>

      <div className="flex-1 flex flex-col">
        <StatusIndicator isHireJobsUrl={state.isHireJobsUrl} />
        
        {state.error && (
          <ErrorDisplay 
            message={state.error} 
            onDismiss={reset}
          />
        )}

        <LoadingIndicator status={state.status} />

        {state.status === ProcessingStatus.COMPLETED && state.referenceMessage && (
          <ReferenceMessage
            message={state.referenceMessage}
            jobTitle={state.jobTitle || 'Job Position'}
            companyName={state.companyName || 'Company'}
          />
        )}
      </div>

      <div className="mt-auto">
        <GenerateButton
          status={state.status}
          isHireJobsUrl={state.isHireJobsUrl}
          onClick={handleGenerateClick}
        />
        
        <footer className="mt-4 text-center text-xs text-gray-400">
          <p>v1.0.0 • Made with ♥ for HireJobs users</p>
        </footer>
      </div>
    </div>
  );
};

export default Popup;