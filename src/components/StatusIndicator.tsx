import React from 'react';

interface StatusIndicatorProps {
  isHireJobsUrl: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isHireJobsUrl }) => {
  const handleVisitHireJobs = () => {
    chrome.tabs.create({ url: 'https://hirejobs.in/' });
  };

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center">
        <div 
          className={`w-3 h-3 rounded-full mr-2 ${
            isHireJobsUrl ? 'bg-green-500' : 'bg-gray-400'
          }`}
        ></div>
        <p className="text-sm">
          {isHireJobsUrl
            ? 'Ready to generate referral request'
            : 'Not on a HireJobs job posting page'}
        </p>
      </div>
      
      {!isHireJobsUrl && (
        <button
          onClick={handleVisitHireJobs}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          Visit HireJobs
        </button>
      )}
    </div>
  );
};

export default StatusIndicator;