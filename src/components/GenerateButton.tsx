import React from 'react';
import { ProcessingStatus } from '../types';

interface GenerateButtonProps {
  status: ProcessingStatus;
  isHireJobsUrl: boolean;
  isApiKeyConfigured: boolean;
  onClick: () => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  status, 
  isHireJobsUrl, 
  isApiKeyConfigured,
  onClick 
}) => {
  const isLoading = status === ProcessingStatus.VALIDATING || 
                   status === ProcessingStatus.GENERATING || 
                   status === ProcessingStatus.FETCHING;
  
  const isDisabled = !isHireJobsUrl || isLoading || !isApiKeyConfigured;
  
  let buttonText = "Generate Referral Request";
  if (status === ProcessingStatus.COMPLETED) {
    buttonText = "Generate New Referral";
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
          : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {buttonText}
    </button>
  );
};

export default GenerateButton;