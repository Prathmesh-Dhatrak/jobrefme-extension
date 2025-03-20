import React from 'react';
import { useAppContext } from './contexts/AppContext';
import { ProcessingStatus } from './types';
import StatusIndicator from './components/StatusIndicator';
import GenerateButton from './components/GenerateButton';
import LoadingIndicator from './components/LoadingIndicator';
import ReferralMessage from './components/ReferralMessage';
import ErrorDisplay from './components/ErrorDisplay';
import ApiKeyForm from './components/ApiKeyForm';
import LoginPage from './pages/LoginPage';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import Loading from './components/Loading';
import TemplateSelector from './components/TemplateSelector';

const Popup: React.FC = () => {
  const { state, generateReferral, clearCacheAndRetry, reset, setSelectedTemplate } = useAppContext();

  const handleGenerateClick = () => {
    if (state.isHireJobsUrl && state.currentUrl) {
      if (state.status === ProcessingStatus.COMPLETED) {
        reset();
        generateReferral(state.currentUrl);
        return;
      }
      if (state.status === ProcessingStatus.ERROR && state.errorJobUrl) {
        clearCacheAndRetry(state.errorJobUrl);
      } else {
        generateReferral(state.currentUrl);
      }
    }
  };

  if (state.isAuthLoading) {
    return (
      <div className="p-4 bg-gray-50" style={{ width: '360px', minHeight: '400px' }}>
        <Loading />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  if (!state.user?.hasGeminiApiKey) {
    return (
      <div className="p-4 bg-gray-50 flex flex-col" style={{ width: '360px', minHeight: '400px' }}>
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="JobRefMe Logo" className="w-6 h-6" />
              <h1 className="text-lg font-bold text-gray-900">JobRefMe</h1>
            </div>
            <UserProfile />
          </div>
          <p className="text-xs text-gray-500">Referral Request Generator</p>
        </header>

        <div className="flex-1">
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded border border-amber-200">
            <p className="text-sm font-medium">API Key Required</p>
            <p className="text-xs mt-1">
              To use JobRefMe, you need to provide a Google Gemini API key.
            </p>
          </div>

          <ApiKeyForm />
        </div>

        <Footer className="mt-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 flex flex-col" style={{ width: '360px', minHeight: '400px' }}>
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="JobRefMe Logo" className="w-6 h-6" />
            <h1 className="text-lg font-bold text-gray-900">JobRefMe</h1>
          </div>
          <UserProfile />
        </div>
        <p className="text-xs text-gray-500">Referral Request Generator</p>
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

        {state.isHireJobsUrl && state.status === ProcessingStatus.IDLE && (
          <div className="mb-4">
            <TemplateSelector
              selectedTemplateId={state.selectedTemplateId}
              onSelectTemplate={setSelectedTemplate}
              disabled={state.status !== ProcessingStatus.IDLE}
            />
          </div>
        )}

        {state.status === ProcessingStatus.COMPLETED && state.referralMessage && (
          <ReferralMessage
            message={state.referralMessage}
            jobTitle={state.jobTitle || 'Job Position'}
            companyName={state.companyName || 'Company'}
          />
        )}
      </div>

      <div className="mt-auto">
        <GenerateButton
          status={state.status}
          isHireJobsUrl={state.isHireJobsUrl}
          isApiKeyConfigured={Boolean(state.user?.hasGeminiApiKey)}
          hasErrorJobUrl={Boolean(state.errorJobUrl)}
          onClick={handleGenerateClick}
        />

        <Footer className="mt-2" />
      </div>
    </div>
  );
};

export default Popup;