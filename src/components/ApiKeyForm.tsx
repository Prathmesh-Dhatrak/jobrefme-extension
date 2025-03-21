import React, { useState } from 'react';
import { useAuth, useUser, useUI } from '../hooks/useZustandStore';

interface ApiKeyFormProps {
  onSuccess?: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const { storeGeminiApiKey } = useUser();
  const { error, setError } = useUI();
  
  const [apiKey, setApiKey] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setLocalError('Please enter a Gemini API key');
      return;
    }

    if (apiKey.length < 20) {
      setLocalError('This doesn\'t look like a valid Gemini API key');
      return;
    }

    setIsSaving(true);
    setLocalError('');
    setError(null);
    
    try {
      const success = await storeGeminiApiKey(apiKey);
      
      if (success) {
        setShowSuccess(true);
        setApiKey('');

        setTimeout(() => {
          setShowSuccess(false);
          if (onSuccess) onSuccess();
        }, 3000);
      } else {
        setLocalError('Failed to save API key. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setLocalError(`Failed to save API key: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-700">
        <p className="font-medium">Authentication Required</p>
        <p className="mt-1">You need to log in before you can set up your Gemini API key.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Set Your Gemini API Key</h2>
      <p className="text-sm text-gray-600 mb-3">
        JobRefMe requires a Google Gemini API key to generate referral messages.
      </p>
      
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          <p className="font-medium">Success!</p>
          <p>Your Gemini API key has been saved securely.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            Gemini API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your Gemini API key"
          />
          {localError && <p className="text-red-500 text-xs mt-1">{localError}</p>}
          {error && !localError && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isSaving 
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save API Key'}
          </button>
          
          <a 
            href="https://ai.google.dev/tutorials/setup" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            How to get an API key
          </a>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyForm;