import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';

const AuthCallback: React.FC = () => {
  const { handleAuthCallback } = useAppContext();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      if (isProcessing) return;
      
      try {
        setIsProcessing(true);
        console.log('Auth callback initialized, checking URL parameters...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          console.error('No token found in URL parameters');
          setStatus('error');
          setMessage('No authentication token found in URL');
          return;
        }
        
        console.log('Received auth token, processing...');
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timed out')), 15000)
        );
        
        const authPromise = handleAuthCallback(token);
        
        const success = await Promise.race([authPromise, timeoutPromise])
          .catch(error => {
            console.error('Auth process error:', error);
            return false;
          });
        
        if (success) {
          setStatus('success');
          setMessage('Authentication successful! You can close this window.');
          
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Failed to process authentication. Please try again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication');
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <img src="/icon-128.png" alt="JobRefMe Logo" className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-gray-900">JobRefMe Authentication</h1>
        </div>

        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-600">{message}</p>
            <p className="mt-2 text-xs text-gray-500">This window will close automatically...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-600">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;