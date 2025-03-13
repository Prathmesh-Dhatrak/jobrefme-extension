import React, { useState } from 'react';

interface ReferenceMessageProps {
  message: string;
  jobTitle: string;
  companyName: string;
}

const ReferenceMessage: React.FC<ReferenceMessageProps> = ({
  message,
  jobTitle,
  companyName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Reference Request for {jobTitle} at {companyName}
        </h3>
        <button
          onClick={handleCopy}
          className="text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 px-2 py-1 rounded"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-md p-3 mb-4 max-h-64 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
          {message}
        </pre>
      </div>
    </div>
  );
};

export default ReferenceMessage;