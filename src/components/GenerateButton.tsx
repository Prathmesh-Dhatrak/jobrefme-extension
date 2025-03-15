import React from 'react';
import { ProcessingStatus } from '../types';

interface GenerateButtonProps {
  status: ProcessingStatus;
  isHireJobsUrl: boolean;
  onClick: () => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ status, isHireJobsUrl, onClick }) => {
  const isLoading = status === ProcessingStatus.VALIDATING || 
                   status === ProcessingStatus.GENERATING || 
                   status === ProcessingStatus.FETCHING;
  
  const isDisabled = !isHireJobsUrl || isLoading;
  
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
      {status === ProcessingStatus.COMPLETED
        ? 'Generate New Referral'
        : 'Generate Referral Request'}
    </button>
  );
};

export default GenerateButton;