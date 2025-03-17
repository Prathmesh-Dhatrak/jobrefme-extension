import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import ApiKeyForm from '../components/ApiKeyForm';

const WelcomePage: React.FC = () => {
  const { setApiKey } = useAppContext();

  const handleApiKeySaved = async (apiKey: string) => {
    await setApiKey(apiKey);
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/icon-128.png" alt="JobRefMe Logo" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to JobRefMe!</h1>
          <p className="text-gray-600 mt-2">
            Generate personalized referral requests for HireJobs.in job postings
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Let's Get Started</h2>
            
            <p className="text-sm text-gray-700 mb-4">
              JobRefMe uses Google's Gemini AI to create tailored referral messages. You'll need to provide your own Gemini API key to use this extension.
            </p>
            
            <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-md font-medium mb-2">How to use JobRefMe:</h3>
          <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
            <li>Visit a job posting on HireJobs.in</li>
            <li>Click the JobRefMe extension icon</li>
            <li>Click "Generate Referral Request"</li>
            <li>Copy the generated message and use it to request a referral</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;