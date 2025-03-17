import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppContextType, ProcessingStatus } from '../types';
import { useHireJobsDetection } from '../hooks/useHireJobsDetection';
import {
  validateJobUrl,
  initiateReferralGeneration,
  pollReferralResult
} from '../services/apiService';

const initialState: AppState = {
  isHireJobsUrl: false,
  currentUrl: '',
  status: ProcessingStatus.IDLE,
  error: null,
  referralMessage: null,
  jobTitle: null,
  companyName: null,
  geminiApiKey: null,
  isApiKeyConfigured: false
};

type Action =
  | { type: 'SET_HIREJOBS_STATUS'; payload: { isHireJobsUrl: boolean; currentUrl: string } }
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REFERENCE_DATA'; payload: { referralMessage: string; jobTitle: string; companyName: string } }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_API_KEY_CONFIGURED'; payload: boolean }
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
    case 'SET_API_KEY':
      return {
        ...state,
        geminiApiKey: action.payload,
        isApiKeyConfigured: Boolean(action.payload)
      };
    case 'SET_API_KEY_CONFIGURED':
      return {
        ...state,
        isApiKeyConfigured: action.payload
      };
    case 'RESET':
      return {
        ...initialState,
        isHireJobsUrl: state.isHireJobsUrl,
        currentUrl: state.currentUrl,
        geminiApiKey: state.geminiApiKey,
        isApiKeyConfigured: state.isApiKeyConfigured
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isHireJobsUrl, currentUrl } = useHireJobsDetection();

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const result = await chrome.storage.local.get(['geminiApiKey']);
        const storedApiKey = result.geminiApiKey;
        
        if (storedApiKey) {
          dispatch({ type: 'SET_API_KEY', payload: storedApiKey });
        } else {
          dispatch({ type: 'SET_API_KEY_CONFIGURED', payload: false });
        }
      } catch (error) {
        console.error('Error loading API key from storage:', error);
      }
    };

    loadApiKey();
  }, []);

  useEffect(() => {
    dispatch({
      type: 'SET_HIREJOBS_STATUS',
      payload: { isHireJobsUrl, currentUrl }
    });
  }, [isHireJobsUrl, currentUrl]);

  /**
   * Sets the API key and saves it to storage
   */
  const setApiKey = async (apiKey: string): Promise<void> => {
    try {
      await chrome.storage.local.set({ geminiApiKey: apiKey });
      dispatch({ type: 'SET_API_KEY', payload: apiKey });
    } catch (error) {
      console.error('Error saving API key to storage:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to save API key' 
      });
    }
  };

  /**
   * Validates if a job URL is valid
   */
  const validateUrl = async (url: string): Promise<void> => {
    if (!state.geminiApiKey) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Gemini API key is required. Please configure it in the settings.' 
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      
      const validationResult = await validateJobUrl(url, state.geminiApiKey);
      
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
    if (!state.geminiApiKey) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Gemini API key is required. Please configure it in the settings.' 
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      await validateJobUrl(url, state.geminiApiKey);
      
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.GENERATING });
      await initiateReferralGeneration(url, state.geminiApiKey);

      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.FETCHING });
      const result = await pollReferralResult(url, state.geminiApiKey);
      
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

  const contextValue: AppContextType = {
    state,
    validateUrl,
    generateReferral,
    setApiKey,
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