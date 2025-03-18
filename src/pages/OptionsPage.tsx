import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ApiKeyForm from '../components/ApiKeyForm';
import LoginPage from '../pages/LoginPage';
import DangerZone from '../components/DangerZone';

const OptionsPage: React.FC = () => {
  const { state, logout, deleteGeminiApiKey } = useAppContext();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteApiKey = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your Gemini API key? This action cannot be undone and you will need to provide it again to generate referrals.'
    );

    if (confirmed) {
      try {
        await deleteGeminiApiKey();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  // Show loading indicator while auth is being initialized
  if (state.isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/icon-128.png" alt="JobRefMe Logo" className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">JobRefMe Settings</h1>
          <p className="text-gray-600 mt-1">Configure your extension settings</p>
        </div>

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Your API key has been deleted successfully!
          </div>
        )}

        <div className="mb-8">
          {state.user?.hasGeminiApiKey ? (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Your API Key</h2>
              <p className="text-sm text-gray-600 mb-3">
                You have successfully configured your Gemini API key. It is securely stored on our server.
              </p>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-sm text-green-700">API key is configured and ready to use</p>
                </div>
              </div>
              
              <DangerZone
                title="Remove API Key"
                description="Delete your stored Gemini API key from our server. You will need to enter it again to generate referrals."
                buttonText="Delete API Key"
                onAction={handleDeleteApiKey}
              />
            </div>
          ) : (
            <ApiKeyForm />
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-2">Account Information</h2>
          {state.user && (
            <div className="text-sm text-gray-700">
              <div className="flex items-center mb-3">
                {state.user.profilePicture ? (
                  <img
                    src={state.user.profilePicture}
                    alt={state.user.displayName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {state.user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{state.user.displayName}</p>
                  <p className="text-gray-500">{state.user.email}</p>
                </div>
              </div>
              
              <DangerZone
                title="Log Out"
                description="Log out from your account. You will need to log in again to use JobRefMe."
                buttonText="Log Out"
                onAction={handleLogout}
              />
            </div>
          )}
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