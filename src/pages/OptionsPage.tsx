import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ApiKeyForm from '../components/ApiKeyForm';

const OptionsPage: React.FC = () => {
  const { state, setApiKey } = useAppContext();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleApiKeySaved = (apiKey: string) => {
    setApiKey(apiKey);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/icon-128.png" alt="JobRefMe Logo" className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">JobRefMe Settings</h1>
          <p className="text-gray-600 mt-1">Configure your extension settings</p>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Your API key has been saved successfully!
          </div>
        )}

        <div className="mb-8">
          <ApiKeyForm 
            onApiKeySaved={handleApiKeySaved} 
            initialApiKey={state.geminiApiKey || ''}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">About JobRefMe</h2>
          <p className="text-sm text-gray-600 mb-3">
            JobRefMe helps you create personalized referral request messages for job postings on HireJobs.in.
          </p>
          
          <h3 className="text-md font-medium mb-1">How to use:</h3>
          <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
            <li>Visit a job posting on HireJobs.in</li>
            <li>Click the JobRefMe extension icon</li>
            <li>Click "Generate Referral Request"</li>
            <li>Copy the generated message and use it to request a referral</li>
          </ol>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Version 1.0.0</p>
            <p>Made with ♥ for HireJobs users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;