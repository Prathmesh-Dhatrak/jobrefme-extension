import React from 'react';
import { ProcessingStatus } from '../types';

interface LoadingIndicatorProps {
  status: ProcessingStatus;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ status }) => {
  if (status === ProcessingStatus.IDLE || status === ProcessingStatus.COMPLETED || status === ProcessingStatus.ERROR) {
    return null;
  }

  const messages = {
    [ProcessingStatus.VALIDATING]: 'Validating URL...',
    [ProcessingStatus.GENERATING]: 'Generating referral...',
    [ProcessingStatus.FETCHING]: 'Retrieving message...',
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="mt-2 text-sm text-gray-600">{messages[status]}</p>
    </div>
  );
};

export default LoadingIndicator;