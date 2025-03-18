import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppContextType, ProcessingStatus, UserState } from '../types';
import { useHireJobsDetection } from '../hooks/useHireJobsDetection';
import {
  validateJobUrl,
  initiateReferralGeneration,
  pollReferralResult
} from '../services/apiService';
import authService from '../services/authService';

const initialState: AppState = {
  isHireJobsUrl: false,
  currentUrl: '',
  status: ProcessingStatus.IDLE,
  error: null,
  referralMessage: null,
  jobTitle: null,
  companyName: null,
  user: null,
  isAuthenticated: false,
  isAuthLoading: true
};

type Action =
  | { type: 'SET_HIREJOBS_STATUS'; payload: { isHireJobsUrl: boolean; currentUrl: string } }
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REFERENCE_DATA'; payload: { referralMessage: string; jobTitle: string; companyName: string } }
  | { type: 'SET_AUTH_STATUS'; payload: { isAuthenticated: boolean; user: UserState | null } }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'RESET' };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_HIREJOBS_STATUS':
      return {
        ...state,
        isHireJobsUrl: action.payload.isHireJobsUrl,
        currentUrl: action.payload.currentUrl
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        error: action.payload === ProcessingStatus.ERROR ? state.error : null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: action.payload ? ProcessingStatus.ERROR : state.status
      };
    case 'SET_REFERENCE_DATA':
      return {
        ...state,
        referralMessage: action.payload.referralMessage,
        jobTitle: action.payload.jobTitle,
        companyName: action.payload.companyName,
        status: ProcessingStatus.COMPLETED
      };
    case 'SET_AUTH_STATUS':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user
      };
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        isAuthLoading: action.payload
      };
    case 'RESET':
      return {
        ...initialState,
        isHireJobsUrl: state.isHireJobsUrl,
        currentUrl: state.currentUrl,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAuthLoading: state.isAuthLoading
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isHireJobsUrl, currentUrl } = useHireJobsDetection();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated) {
          const userProfile = await authService.fetchUserProfile();
          
          if (userProfile) {
            console.log('Auth initialized successfully with profile:', userProfile);
            dispatch({ 
              type: 'SET_AUTH_STATUS', 
              payload: { 
                isAuthenticated: true, 
                user: {
                  id: userProfile.id,
                  email: userProfile.email,
                  displayName: userProfile.displayName,
                  firstName: userProfile.firstName,
                  lastName: userProfile.lastName,
                  profilePicture: userProfile.profilePicture,
                  hasGeminiApiKey: userProfile.hasGeminiApiKey
                }
              }
            });
          } else {
            console.log('Profile fetch failed during auth initialization');
            dispatch({ 
              type: 'SET_AUTH_STATUS', 
              payload: { isAuthenticated: false, user: null }
            });
          }
        } else {
          console.log('User not authenticated during initialization');
          dispatch({ 
            type: 'SET_AUTH_STATUS', 
            payload: { isAuthenticated: false, user: null }
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ 
          type: 'SET_AUTH_STATUS', 
          payload: { isAuthenticated: false, user: null }
        });
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        setInitialized(true);
      }
    };

    initializeAuth();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authToken || changes.userProfile) {
        console.log('Auth storage changed, reinitializing auth');
        initializeAuth();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    dispatch({
      type: 'SET_HIREJOBS_STATUS',
      payload: { isHireJobsUrl, currentUrl }
    });
  }, [isHireJobsUrl, currentUrl]);

  /**
   * Handle the authentication callback
   */
  const handleAuthCallback = async (token: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      
      const success = await authService.handleAuthCallback(token);
      
      if (success) {
        const userProfile = await authService.fetchUserProfile();
        
        if (userProfile) {
          dispatch({ 
            type: 'SET_AUTH_STATUS', 
            payload: { 
              isAuthenticated: true, 
              user: {
                id: userProfile.id,
                email: userProfile.email,
                displayName: userProfile.displayName,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                profilePicture: userProfile.profilePicture,
                hasGeminiApiKey: userProfile.hasGeminiApiKey
              }
            }
          });
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  };

  /**
   * Start the login process
   */
  const login = async (): Promise<void> => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to login' 
      });
    }
  };

  /**
   * Logout the user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ 
        type: 'SET_AUTH_STATUS', 
        payload: { isAuthenticated: false, user: null }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Store Gemini API key
   */
  const storeGeminiApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const success = await authService.storeGeminiApiKey(apiKey);
      
      if (success && state.user) {
        // Update local user state
        dispatch({ 
          type: 'SET_AUTH_STATUS', 
          payload: { 
            isAuthenticated: true, 
            user: {
              ...state.user,
              hasGeminiApiKey: true
            }
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error storing API key:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to store API key' 
      });
      return false;
    }
  };

  /**
   * Delete Gemini API key
   */
  const deleteGeminiApiKey = async (): Promise<boolean> => {
    try {
      const success = await authService.deleteGeminiApiKey();
      
      if (success && state.user) {
        // Update local user state
        dispatch({ 
          type: 'SET_AUTH_STATUS', 
          payload: { 
            isAuthenticated: true, 
            user: {
              ...state.user,
              hasGeminiApiKey: false
            }
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting API key:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to delete API key' 
      });
      return false;
    }
  };

  /**
   * Validates if a job URL is valid
   */
  const validateUrl = async (url: string): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Authentication required. Please log in to continue.' 
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      
      const validationResult = await validateJobUrl(url);
      
      if (!validationResult.valid) {
        throw new Error('This job posting URL is not valid or accessible');
      }
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to validate URL' 
      });
    }
  };

  /**
   * Generates a referral message for a job posting
   */
  const generateReferral = async (url: string): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Authentication required. Please log in to continue.' 
      });
      return;
    }

    if (!state.user?.hasGeminiApiKey) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Gemini API key is required. Please configure it in the settings.' 
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      await validateJobUrl(url);
      
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.GENERATING });
      await initiateReferralGeneration(url);

      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.FETCHING });
      const result = await pollReferralResult(url);
      
      dispatch({
        type: 'SET_REFERENCE_DATA',
        payload: {
          referralMessage: result.referralMessage,
          jobTitle: result.jobTitle,
          companyName: result.companyName
        }
      });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate referral'
      });
    }
  };

  /**
   * Resets the application state
   */
  const reset = (): void => {
    dispatch({ type: 'RESET' });
  };

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>;
  }

  const contextValue: AppContextType = {
    state,
    validateUrl,
    generateReferral,
    login,
    logout,
    handleAuthCallback,
    storeGeminiApiKey,
    deleteGeminiApiKey,
    reset
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}