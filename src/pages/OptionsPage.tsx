import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import LoginPage from '../pages/LoginPage';
import TemplatePage from './TemplatePage';
import ApiKeyForm from '../components/ApiKeyForm';
import DangerZone from '../components/DangerZone';
import Loading from '../components/Loading';

enum SettingsTab {
  API_KEY = 'api-key',
  ACCOUNT = 'account',
  CACHE = 'cache',
  TEMPLATES = 'templates',
  ABOUT = 'about'
}

const OptionsPage: React.FC = () => {
  const { state, logout, deleteGeminiApiKey, clearCache } = useAppContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.API_KEY);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [reloadAttempted, setReloadAttempted] = useState(false);

  useEffect(() => {
    const checkReloadStatus = async () => {
      try {
        const data = await chrome.storage.local.get('optionsReloadTimestamp');
        const reloadTimestamp = data.optionsReloadTimestamp;
        
        const currentTime = Date.now();
        const reloadNeeded = !reloadTimestamp || (currentTime - reloadTimestamp > 60000);
        
        if (reloadNeeded && !reloadAttempted && !state.isAuthLoading) {
          await chrome.storage.local.set({ optionsReloadTimestamp: currentTime });
          setReloadAttempted(true);
          setTimeout(() => {
            console.log('Reloading options page once...');
            window.location.reload();
          }, 100);
        }
      } catch (error) {
        console.error('Error checking reload status:', error);
      }
    };

    if (!state.isAuthLoading) {
      setAuthChecked(true);
      if (!reloadAttempted) {
        checkReloadStatus();
      }
    }
  }, [state.isAuthLoading, reloadAttempted]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
        showSuccessMessage('Your API key has been deleted successfully!');
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all your cached referrals? This will remove all stored referral messages and you\'ll need to regenerate them.'
    );

    if (confirmed) {
      try {
        setIsClearing(true);
        const success = await clearCache();
        setIsClearing(false);

        if (success) {
          showSuccessMessage('Cache cleared successfully!');
        }
      } catch (error) {
        setIsClearing(false);
        console.error('Error clearing cache:', error);
      }
    }
  };

  if (state.isAuthLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loading />
      </div>
    );
  }

  // Only show the login page after we've confirmed the user is not authenticated
  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/icon-128.png" alt="JobRefMe Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">JobRefMe Settings</h1>
          <p className="text-gray-600 mt-1">Configure your extension settings</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md max-w-xl mx-auto">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab(SettingsTab.API_KEY)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === SettingsTab.API_KEY
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                        API Key
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab(SettingsTab.TEMPLATES)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === SettingsTab.TEMPLATES
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                        </svg>
                        Templates
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab(SettingsTab.ACCOUNT)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === SettingsTab.ACCOUNT
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Account
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab(SettingsTab.CACHE)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === SettingsTab.CACHE
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Cache Management
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab(SettingsTab.ABOUT)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === SettingsTab.ABOUT
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        About
                      </div>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {activeTab === SettingsTab.API_KEY && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">API Key Settings</h2>

                  {state.user?.hasGeminiApiKey ? (
                    <div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">API key is configured</p>
                            <p className="text-xs text-green-700 mt-1">Your Gemini API key is securely stored and ready to use.</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        Your API key is securely stored on our servers and is used to generate personalized referral
                        messages through Google's Gemini AI. You can delete your API key at any time using the button below.
                      </p>

                      <DangerZone
                        title="Remove API Key"
                        description="Delete your stored Gemini API key. You'll need to enter it again to generate referrals."
                        buttonText="Delete API Key"
                        onAction={handleDeleteApiKey}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        JobRefMe requires a Google Gemini API key to generate personalized referral messages.
                        You can get one from Google AI Studio and provide it below.
                      </p>
                      <ApiKeyForm />
                    </div>
                  )}
                </div>
              )}
              {activeTab === SettingsTab.TEMPLATES && (
                <div>
                  <TemplatePage />
                </div>
              )}

              {activeTab === SettingsTab.ACCOUNT && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Account Information</h2>

                  {state.user && (
                    <div>
                      <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                        {state.user.profilePicture ? (
                          <img
                            src={state.user.profilePicture}
                            alt={state.user.displayName}
                            className="w-16 h-16 rounded-full mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-medium mr-4">
                            {state.user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-lg">{state.user.displayName}</h3>
                          <p className="text-gray-500">{state.user.email}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        You're signed in with your Google account. This allows us to securely store your preferences
                        and API keys. Your account information is never shared with third parties.
                      </p>

                      <DangerZone
                        title="Log Out"
                        description="Log out from your account. You'll need to log in again to use JobRefMe."
                        buttonText="Log Out"
                        onAction={handleLogout}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === SettingsTab.CACHE && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Cache Management</h2>

                  <p className="text-sm text-gray-600 mb-4">
                    JobRefMe caches generated referral messages to provide faster responses and reduce API usage.
                    You can clear the cache if you want to regenerate all referral messages.
                  </p>

                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700">Referral Cache</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Clear All Cached Referrals</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            This will remove all stored referral messages. You'll need to regenerate them when needed.
                          </p>
                        </div>
                        <button
                          onClick={handleClearCache}
                          disabled={isClearing}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${isClearing
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-50'
                            }`}
                        >
                          {isClearing ? 'Clearing...' : 'Clear Cache'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Cache Benefits</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Caching helps JobRefMe provide instant responses for previously generated referrals,
                          reduces API usage, and saves your Gemini API quota. We recommend keeping the cache
                          unless you experience issues with outdated content.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === SettingsTab.ABOUT && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">About JobRefMe</h2>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                      JobRefMe helps you create personalized referral request messages for job postings on HireJobs.in.
                      It uses Google's Gemini AI to craft tailored messages that highlight your skills and experience.
                    </p>

                    <h3 className="text-md font-medium mt-4 mb-2">How to use JobRefMe:</h3>
                    <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2">
                      <li>Visit a job posting on HireJobs.in</li>
                      <li>Click the JobRefMe extension icon in your browser toolbar</li>
                      <li>Click "Generate Referral Request"</li>
                      <li>Copy the generated message and use it to request a referral</li>
                    </ol>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium mb-2">Useful Links</h3>
                    <ul className="text-sm text-primary-600 space-y-2">
                      <li>
                        <a href="https://github.com/Prathmesh-Dhatrak/jobrefme-extension" className="hover:text-primary-800" target="_blank" rel="noopener noreferrer">
                          GitHub Repository
                        </a>
                      </li>
                      <li>
                        <a href="https://ai.google.dev/tutorials/setup" className="hover:text-primary-800" target="_blank" rel="noopener noreferrer">
                          Get a Gemini API Key
                        </a>
                      </li>
                      <li>
                        <a href="https://hirejobs.in" className="hover:text-primary-800" target="_blank" rel="noopener noreferrer">
                          Visit HireJobs.in
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 text-xs text-gray-500">
                    <p>Version 1.0.0</p>
                    <p className="mt-1">Made with ♥ for HireJobs users</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;