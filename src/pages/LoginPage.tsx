import React from 'react';
import { useAuth } from '../hooks/useZustandStore';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

const LoginPage: React.FC = () => {
  const { login, isAuthLoading } = useAuth();

  const handleLoginClick = () => {
    login();
  };

  return (
    <div className="p-4 bg-gray-50 flex flex-col min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="JobRefMe Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-900">JobRefMe</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Referral Request Generator</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <img src="/icon-128.png" alt="JobRefMe Logo" className="w-20 h-20 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800">Welcome to JobRefMe</h2>
            <p className="text-gray-600 mt-2">
              Generate personalized referral requests for HireJobs.in job postings
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              To use JobRefMe, you need to log in with your Google account. This allows us to:
            </p>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Securely store your Gemini API key</li>
              <li>Generate personalized referral messages</li>
              <li>Access your account across devices</li>
            </ul>

            <button
              onClick={handleLoginClick}
              disabled={isAuthLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                isAuthLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isAuthLoading ? (
                <>
                  <Loading />
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5 5 0 0 1-2.2 3.34v2.78h3.56c2.08-1.92 3.28-4.74 3.28-8.13z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77A6.98 6.98 0 0 1 12 18.5c-3.86 0-7.13-2.6-8.3-6.11H.1v2.85A12 12 0 0 0 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.7 12.39c0-.99.17-1.93.48-2.82V6.72H.1A12 12 0 0 0 0 12c0 1.93.47 3.75 1.28 5.38l3.71-2.86a7 7 0 0 1-.29-2.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.5c2.12 0 4.03.74 5.53 2.2l3.14-3.14A11.94 11.94 0 0 0 12 0C7.35 0 3.29 2.57 1.28 6.39l3.7 2.82A7 7 0 0 1 12 5.5z"
                    />
                    <path fill="none" d="M0 0h24v24H0z" />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>

      <Footer className="mt-8" />
    </div>
  );
};

export default LoginPage;