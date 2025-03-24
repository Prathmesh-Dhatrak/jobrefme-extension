import React, { useEffect } from 'react';
import { ProcessingStatus } from './types';
import { useAuth, useUser, useJobProcessing, useUI } from './hooks/useZustandStore';
import { useHireJobsDetection } from './hooks/useHireJobsDetection';

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
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { user } = useUser();
  const { 
    isHireJobsUrl, 
    currentUrl, 
    status, 
    referralMessage, 
    jobTitle, 
    companyName, 
    errorJobUrl,
    selectedJobContent,
    generateReferral, 
    generateReferralFromContent,
    clearCacheAndRetry, 
    resetJobState,
    checkForSelectedContent,
    clearSelectedContent
  } = useJobProcessing();
  const { error } = useUI();
  useHireJobsDetection();

  useEffect(() => {
    const checkContent = async () => {
      if (isAuthenticated && user?.hasGeminiApiKey) {
        const hasContent = await checkForSelectedContent();
        if (hasContent && selectedJobContent && status === ProcessingStatus.IDLE) {
          generateReferralFromContent(selectedJobContent);
        }
      }
    };
    
    checkContent();
  }, [isAuthenticated, user?.hasGeminiApiKey, checkForSelectedContent, generateReferralFromContent, selectedJobContent, status]);

  const handleGenerateClick = () => {
    if (selectedJobContent) {
      if (status === ProcessingStatus.COMPLETED) {
        resetJobState();
        generateReferralFromContent(selectedJobContent);
      } else {
        generateReferralFromContent(selectedJobContent);
      }
      return;
    }
    
    if (isHireJobsUrl && currentUrl) {
      if (status === ProcessingStatus.COMPLETED) {
        resetJobState();
        generateReferral(currentUrl);
        return;
      }
      if (status === ProcessingStatus.ERROR && errorJobUrl) {
        clearCacheAndRetry(errorJobUrl);
      } else {
        generateReferral(currentUrl);
      }
    }
  };
  
  useEffect(() => {
    if (status === ProcessingStatus.COMPLETED) {
      clearSelectedContent();
    }
    
    return () => {
      if (status !== ProcessingStatus.GENERATING && status !== ProcessingStatus.FETCHING) {
        clearSelectedContent();
      }
    };
  }, [status, clearSelectedContent]);

  if (isAuthLoading) {
    return (
      <div className="p-4 bg-gray-50" style={{ width: '360px', minHeight: '400px' }}>
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!user?.hasGeminiApiKey) {
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
        <StatusIndicator hasSelectedContent={!!selectedJobContent} />

        {error && (
          <ErrorDisplay
            message={error}
            onDismiss={resetJobState}
          />
        )}

        <LoadingIndicator status={status} />

        {isHireJobsUrl && !selectedJobContent && status === ProcessingStatus.IDLE && (
          <div className="mb-4">
            <TemplateSelector />
          </div>
        )}

        {status === ProcessingStatus.COMPLETED && referralMessage && (
          <ReferralMessage
            message={referralMessage}
            jobTitle={jobTitle || 'Job Position'}
            companyName={companyName || 'Company'}
          />
        )}
      </div>

      <div className="mt-auto">
        <GenerateButton
          onClick={handleGenerateClick}
        />

        <Footer className="mt-2" />
      </div>
    </div>
  );
};

export default Popup;