import React from 'react';
import { useJobProcessing } from '../hooks/useZustandStore';
import { ProcessingStatus } from '../types';

interface StatusIndicatorProps {
  isHireJobsUrl?: boolean;
  useStoreValue?: boolean;
  hasSelectedContent?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  isHireJobsUrl: propIsHireJobsUrl,
  useStoreValue = true,
  hasSelectedContent
}) => {
  const { 
    isHireJobsUrl: storeIsHireJobsUrl, 
    selectedJobContent,
    status 
  } = useJobProcessing();
  
  const isHireJobsUrl = useStoreValue ? storeIsHireJobsUrl : propIsHireJobsUrl;
  const hasContent = hasSelectedContent ?? !!selectedJobContent;

  const handleVisitHireJobs = () => {
    chrome.tabs.create({ url: 'https://hirejobs.in/' });
  };

  if (status === ProcessingStatus.GENERATING || 
      status === ProcessingStatus.VALIDATING || 
      status === ProcessingStatus.FETCHING) {
    return null;
  }

  if (hasContent) {
    return (
      <div className="p-3 mb-4 bg-blue-50 text-blue-700 rounded border border-blue-200">
        <p className="text-sm font-medium">Processing Selected Job Content</p>
        <p className="text-xs mt-1">
          Generating referral from your selected text. Click Generate to begin processing.
        </p>
      </div>
    );
  }

  if (isHireJobsUrl) {
    return (
      <div className="p-3 mb-4 bg-green-50 text-green-700 rounded border border-green-200">
        <p className="text-sm font-medium">HireJobs.in Job Detected</p>
        <p className="text-xs mt-1">
          Click Generate to create a personalized referral message for this job.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 mb-4 bg-amber-50 text-amber-700 rounded border border-amber-200">
      <div className="flex flex-col">
        <p className="text-sm font-medium">No Job Detected</p>
        <p className="text-xs mt-1">
          Either navigate to a HireJobs.in job posting, or select job content on any website and use the right-click menu option "Generate Referral from Selected Content".
        </p>
        
        <button
          onClick={handleVisitHireJobs}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center self-start gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          Visit HireJobs
        </button>
      </div>
    </div>
  );
};

export default StatusIndicator;