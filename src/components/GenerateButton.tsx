import React from 'react';
import { ProcessingStatus } from '../types';
import { useJobProcessing, useUser } from '../hooks/useZustandStore';

interface GenerateButtonProps {
  status?: ProcessingStatus;
  isHireJobsUrl?: boolean;
  isApiKeyConfigured?: boolean;
  hasErrorJobUrl?: boolean;
  onClick: () => void;
  useStoreValues?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  status: propStatus, 
  isHireJobsUrl: propIsHireJobsUrl, 
  isApiKeyConfigured: propIsApiKeyConfigured,
  hasErrorJobUrl: propHasErrorJobUrl,
  onClick,
  useStoreValues = true
}) => {
  const { status: storeStatus, isHireJobsUrl: storeIsHireJobsUrl, errorJobUrl } = useJobProcessing();
  const { hasGeminiApiKey } = useUser();
  
  const status = useStoreValues ? storeStatus : propStatus || ProcessingStatus.IDLE;
  const isHireJobsUrl = useStoreValues ? storeIsHireJobsUrl : propIsHireJobsUrl || false;
  const isApiKeyConfigured = useStoreValues ? hasGeminiApiKey : propIsApiKeyConfigured || false;
  const hasErrorJobUrl = useStoreValues ? Boolean(errorJobUrl) : propHasErrorJobUrl || false;
  
  const isLoading = status === ProcessingStatus.VALIDATING || 
                   status === ProcessingStatus.GENERATING || 
                   status === ProcessingStatus.FETCHING;
  
  const isDisabled = !isHireJobsUrl || isLoading || !isApiKeyConfigured;
  
  let buttonText = "Generate Referral Request";
  if (status === ProcessingStatus.COMPLETED) {
    buttonText = "Generate New Referral";
  } else if (status === ProcessingStatus.ERROR && hasErrorJobUrl) {
    buttonText = "Try with Clear Cache";
  } else if (!isApiKeyConfigured) {
    buttonText = "API Key Required";
  }
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
        isDisabled
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : status === ProcessingStatus.ERROR && hasErrorJobUrl
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {buttonText}
    </button>
  );
};

export default GenerateButton;