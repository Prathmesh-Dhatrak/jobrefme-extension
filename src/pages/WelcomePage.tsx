import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import ApiKeyForm from '../components/ApiKeyForm';
import LoginPage from './LoginPage';
import Loading from '../components/Loading';

const WelcomePage: React.FC = () => {
  const { state } = useAppContext();

  if (state.isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loading />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

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
            <h2 className="text-lg font-semibold mb-4">Complete Your Setup</h2>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-sm text-green-700">
                <span className="font-medium">Step 1:</span> Google account connected successfully
              </p>
            </div>
            
            <div className={`flex items-center gap-2 p-3 ${state.user?.hasGeminiApiKey ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border rounded-md mb-4`}>
              {state.user?.hasGeminiApiKey ? (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Step 2:</span> Gemini API key configured
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">Step 2:</span> Set up your Gemini API key
                  </p>
                </>
              )}
            </div>
            
            {!state.user?.hasGeminiApiKey && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-4">
                  JobRefMe uses Google's Gemini AI to create tailored referral messages. You'll need to provide your Gemini API key to use this extension.
                </p>
                
                <ApiKeyForm onSuccess={() => {
                  setTimeout(() => {
                    window.close();
                  }, 3000);
                }} />
              </div>
            )}
            
            {state.user?.hasGeminiApiKey && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-700 mb-4">
                  You're all set! JobRefMe is ready to generate personalized referral requests.
                </p>
                <button
                  onClick={() => window.close()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Start Using JobRefMe
                </button>
              </div>
            )}
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